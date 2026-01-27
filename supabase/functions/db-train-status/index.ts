import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Deutsche Bahn Timetables API endpoints
const DB_API_BASE = 'https://apis.deutschebahn.com/db-api-marketplace/apis/timetables/v1';

interface TrainStatus {
  delay_departure_minutes: number | null;
  delay_arrival_minutes: number | null;
  planned_platform: string | null;
  actual_platform: string | null;
  platform_changed: boolean;
  is_cancelled: boolean;
  next_stop: string | null;
  status_message: string;
  status_level: 'ok' | 'warning' | 'error';
  last_updated: string;
  train_found: boolean;
  connection_at_risk?: boolean;
  connection_warning?: string;
}

// Parse DB API time format (YYMMDD HHMM or just HHMM)
function parseDbTime(timeStr: string | undefined): Date | null {
  if (!timeStr) return null;
  
  // Format can be "YYMMDDHHMM" (10 chars) or just "HHMM" (4 chars)
  if (timeStr.length >= 10) {
    const year = 2000 + parseInt(timeStr.substring(0, 2));
    const month = parseInt(timeStr.substring(2, 4)) - 1;
    const day = parseInt(timeStr.substring(4, 6));
    const hour = parseInt(timeStr.substring(6, 8));
    const minute = parseInt(timeStr.substring(8, 10));
    return new Date(year, month, day, hour, minute);
  }
  return null;
}

// Calculate delay in minutes between planned and actual time
function calculateDelay(planned: string | undefined, actual: string | undefined): number | null {
  if (!planned || !actual) return null;
  
  const plannedDate = parseDbTime(planned);
  const actualDate = parseDbTime(actual);
  
  if (!plannedDate || !actualDate) return null;
  
  return Math.round((actualDate.getTime() - plannedDate.getTime()) / 60000);
}

// Extract train category and number from train ID (e.g., "ICE 613" from "-7848039629280074660-2501111210")
function findTrainInTimetable(timetableXml: string, searchTrainNumber: string): any | null {
  // Simple XML parsing for the timetable response
  // Looking for <s> elements with matching train category/number
  
  const trainMatch = searchTrainNumber.match(/([A-Z]+)\s*(\d+)/i);
  if (!trainMatch) return null;
  
  const category = trainMatch[1].toUpperCase();
  const number = trainMatch[2];
  
  // Find <s> elements and check their <tl> children for matching c and n attributes
  const stopRegex = /<s[^>]*id="([^"]+)"[^>]*>[\s\S]*?<tl[^>]*c="([^"]+)"[^>]*n="([^"]+)"[^>]*\/>[\s\S]*?(?:<ar[^>]*pt="([^"]*)"[^>]*pp="([^"]*)"[^>]*\/>)?[\s\S]*?(?:<dp[^>]*pt="([^"]*)"[^>]*pp="([^"]*)"[^>]*\/>)?[\s\S]*?<\/s>/g;
  
  let match;
  while ((match = stopRegex.exec(timetableXml)) !== null) {
    const [, stopId, cat, num, arrPt, arrPp, depPt, depPp] = match;
    if (cat.toUpperCase() === category && num === number) {
      return {
        id: stopId,
        category: cat,
        number: num,
        arrival: { pt: arrPt, pp: arrPp },
        departure: { pt: depPt, pp: depPp }
      };
    }
  }
  
  return null;
}

// Parse full changes response for a specific train
function parseChangesForTrain(changesXml: string, stopId: string): any | null {
  // Find the <s> element with matching id in the changes
  const stopRegex = new RegExp(`<s[^>]*id="${stopId}"[^>]*>([\\s\\S]*?)<\\/s>`, 'i');
  const match = changesXml.match(stopRegex);
  
  if (!match) return null;
  
  const stopContent = match[1];
  
  // Parse arrival changes
  const arrMatch = stopContent.match(/<ar[^>]*ct="([^"]*)"[^>]*(?:cp="([^"]*)")?[^>]*(?:cs="([^"]*)")?[^>]*\/?>/);
  // Parse departure changes
  const depMatch = stopContent.match(/<dp[^>]*ct="([^"]*)"[^>]*(?:cp="([^"]*)")?[^>]*(?:cs="([^"]*)")?[^>]*\/?>/);
  
  return {
    arrival: arrMatch ? {
      ct: arrMatch[1], // changed time
      cp: arrMatch[2], // changed platform
      cs: arrMatch[3], // changed status (c = cancelled)
    } : null,
    departure: depMatch ? {
      ct: depMatch[1],
      cp: depMatch[2],
      cs: depMatch[3],
    } : null
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      booking_id,
      origin_city, 
      train_number, 
      departure_datetime,
      is_departure = true // true = check departure station, false = check arrival station
    } = await req.json();

    console.log('DB Train Status request:', { booking_id, origin_city, train_number, departure_datetime, is_departure });

    const dbApiKey = Deno.env.get('DB_API_KEY');
    const dbClientId = Deno.env.get('DB_API_CLIENT_ID');

    if (!dbApiKey || !dbClientId) {
      console.error('Missing DB API credentials');
      return new Response(JSON.stringify({
        error: 'DB API credentials not configured',
        status: {
          train_found: false,
          status_message: 'API nicht konfiguriert',
          status_level: 'error'
        } as Partial<TrainStatus>
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client to look up station EVA number
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up EVA number for the origin city
    let evaNumber: string | null = null;
    
    // Try exact city match first, then partial match
    const { data: stationData } = await supabase
      .from('db_station_mapping')
      .select('eva_number, station_name')
      .or(`city_name.ilike.%${origin_city}%,station_name.ilike.%${origin_city}%`)
      .limit(1);

    if (stationData && stationData.length > 0) {
      evaNumber = stationData[0].eva_number;
      console.log(`Found EVA number ${evaNumber} for ${origin_city} (${stationData[0].station_name})`);
    } else {
      console.log(`No EVA number found for ${origin_city}, trying to find via DB API...`);
      
      // Could implement station search via DB API here in the future
      return new Response(JSON.stringify({
        error: 'Station not found',
        status: {
          train_found: false,
          status_message: `Bahnhof "${origin_city}" nicht gefunden`,
          status_level: 'warning'
        } as Partial<TrainStatus>
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse departure datetime to get date and hour
    const departureDate = new Date(departure_datetime);
    const dateStr = departureDate.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
    const hourStr = departureDate.getHours().toString().padStart(2, '0');

    // Step 1: Get the planned timetable for this station and hour
    const timetableUrl = `${DB_API_BASE}/plan/${evaNumber}/${dateStr}/${hourStr}`;
    console.log('Fetching timetable:', timetableUrl);

    let timetableResponse: Response;
    try {
      timetableResponse = await fetch(timetableUrl, {
        headers: {
          'DB-Api-Key': dbApiKey,
          'DB-Client-Id': dbClientId,
          'Accept': 'application/xml'
        }
      });
    } catch (fetchError) {
      console.error('Timetable fetch error:', fetchError);
      return new Response(JSON.stringify({
        error: 'Network error fetching timetable',
        status: {
          train_found: false,
          status_message: 'Netzwerkfehler beim Abrufen',
          status_level: 'warning'
        } as Partial<TrainStatus>
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Timetable response status:', timetableResponse.status);

    if (!timetableResponse.ok) {
      let errorText = '';
      try {
        errorText = await timetableResponse.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      console.error('Timetable API error:', timetableResponse.status, errorText);
      
      return new Response(JSON.stringify({
        error: 'Timetable API error',
        status: {
          train_found: false,
          status_message: 'Fahrplan konnte nicht abgerufen werden',
          status_level: 'warning'
        } as Partial<TrainStatus>
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let timetableXml = '';
    try {
      timetableXml = await timetableResponse.text();
    } catch (textError) {
      console.error('Error reading timetable response body:', textError);
      return new Response(JSON.stringify({
        error: 'Error reading API response',
        status: {
          train_found: false,
          status_message: 'Antwort konnte nicht gelesen werden',
          status_level: 'warning'
        } as Partial<TrainStatus>
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Timetable response length:', timetableXml.length);
    
    if (!timetableXml || timetableXml.length === 0) {
      console.log('Empty timetable response from DB API');
      return new Response(JSON.stringify({
        status: {
          train_found: false,
          delay_departure_minutes: null,
          delay_arrival_minutes: null,
          planned_platform: null,
          actual_platform: null,
          platform_changed: false,
          is_cancelled: false,
          next_stop: null,
          status_message: 'Keine Fahrplandaten verfügbar',
          status_level: 'warning',
          last_updated: new Date().toISOString()
        } as TrainStatus
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find our train in the timetable
    const trainInfo = findTrainInTimetable(timetableXml, train_number);
    
    if (!trainInfo) {
      console.log(`Train ${train_number} not found in timetable for ${hourStr}:00`);
      
      // Try the previous and next hour as well
      const prevHour = (parseInt(hourStr) - 1 + 24) % 24;
      const nextHour = (parseInt(hourStr) + 1) % 24;
      
      return new Response(JSON.stringify({
        status: {
          train_found: false,
          delay_departure_minutes: null,
          delay_arrival_minutes: null,
          planned_platform: null,
          actual_platform: null,
          platform_changed: false,
          is_cancelled: false,
          next_stop: null,
          status_message: `${train_number} nicht im Fahrplan gefunden`,
          status_level: 'warning',
          last_updated: new Date().toISOString()
        } as TrainStatus
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found train:', trainInfo);

    // Step 2: Get real-time changes (fchg = full changes, rchg = recent changes)
    const changesUrl = `${DB_API_BASE}/fchg/${evaNumber}`;
    console.log('Fetching changes:', changesUrl);

    const changesResponse = await fetch(changesUrl, {
      headers: {
        'DB-Api-Key': dbApiKey,
        'DB-Client-Id': dbClientId,
        'Accept': 'application/xml'
      }
    });

    let changes: any = null;
    if (changesResponse.ok) {
      const changesXml = await changesResponse.text();
      console.log('Changes response length:', changesXml.length);
      changes = parseChangesForTrain(changesXml, trainInfo.id);
      console.log('Parsed changes for train:', changes);
    } else {
      console.log('No changes available or error:', changesResponse.status);
    }

    // Build status response
    const plannedDeparturePlatform = trainInfo.departure?.pp || null;
    const plannedArrivalPlatform = trainInfo.arrival?.pp || null;
    
    let actualDeparturePlatform = plannedDeparturePlatform;
    let actualArrivalPlatform = plannedArrivalPlatform;
    let delayDeparture: number | null = null;
    let delayArrival: number | null = null;
    let isCancelled = false;

    if (changes) {
      // Check for departure changes
      if (changes.departure) {
        if (changes.departure.cp) actualDeparturePlatform = changes.departure.cp;
        if (changes.departure.cs === 'c') isCancelled = true;
        if (changes.departure.ct && trainInfo.departure?.pt) {
          delayDeparture = calculateDelay(trainInfo.departure.pt, changes.departure.ct);
        }
      }
      
      // Check for arrival changes
      if (changes.arrival) {
        if (changes.arrival.cp) actualArrivalPlatform = changes.arrival.cp;
        if (changes.arrival.cs === 'c') isCancelled = true;
        if (changes.arrival.ct && trainInfo.arrival?.pt) {
          delayArrival = calculateDelay(trainInfo.arrival.pt, changes.arrival.ct);
        }
      }
    }

    // Determine platform change (for the relevant platform based on departure/arrival station)
    const relevantPlannedPlatform = is_departure ? plannedDeparturePlatform : plannedArrivalPlatform;
    const relevantActualPlatform = is_departure ? actualDeparturePlatform : actualArrivalPlatform;
    const platformChanged = relevantPlannedPlatform !== null && 
                           relevantActualPlatform !== null && 
                           relevantPlannedPlatform !== relevantActualPlatform;

    // Determine status level and message
    let statusLevel: 'ok' | 'warning' | 'error' = 'ok';
    let statusMessage = 'Pünktlich';
    
    const relevantDelay = is_departure ? delayDeparture : delayArrival;

    if (isCancelled) {
      statusLevel = 'error';
      statusMessage = 'Zug fällt aus';
    } else if (relevantDelay !== null && relevantDelay > 10) {
      statusLevel = 'error';
      statusMessage = `+${relevantDelay} Min Verspätung`;
    } else if (relevantDelay !== null && relevantDelay > 0) {
      statusLevel = 'warning';
      statusMessage = `+${relevantDelay} Min`;
    } else if (platformChanged) {
      statusLevel = 'warning';
      statusMessage = `Gleis geändert: ${relevantActualPlatform}`;
    }

    const status: TrainStatus = {
      train_found: true,
      delay_departure_minutes: delayDeparture,
      delay_arrival_minutes: delayArrival,
      planned_platform: relevantPlannedPlatform,
      actual_platform: relevantActualPlatform,
      platform_changed: platformChanged,
      is_cancelled: isCancelled,
      next_stop: null, // Could be parsed from wing/ref data
      status_message: statusMessage,
      status_level: statusLevel,
      last_updated: new Date().toISOString()
    };

    console.log('Final status:', status);

    return new Response(JSON.stringify({ status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in db-train-status function:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      status: {
        train_found: false,
        status_message: 'Fehler beim Abrufen des Status',
        status_level: 'error'
      } as Partial<TrainStatus>
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
