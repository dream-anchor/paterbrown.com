import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventData {
  date: string;
  day: string;
  city: string;
  venue: string;
  note?: string;
  ticket_url: string;
}

// Required affiliate parameters
const AFFILIATE_PARAMS = {
  affiliate: 'KZB',
  utm_campaign: 'KBA',
  utm_source: 'KZB',
  utm_medium: 'dp',
};

/**
 * Ensures URL has correct affiliate parameters
 * Handles existing parameters gracefully
 */
function ensureAffiliateParams(url: string): string {
  const fallbackUrl = 'https://www.eventim.de/noapp/artist/antoine-monot/';
  
  if (!url || !url.startsWith('http')) {
    const baseUrl = new URL(fallbackUrl);
    for (const [key, value] of Object.entries(AFFILIATE_PARAMS)) {
      baseUrl.searchParams.set(key, value);
    }
    return baseUrl.toString();
  }
  
  try {
    const urlObj = new URL(url);
    
    // Add or update affiliate parameters
    for (const [key, value] of Object.entries(AFFILIATE_PARAMS)) {
      urlObj.searchParams.set(key, value);
    }
    
    return urlObj.toString();
  } catch {
    // Invalid URL, return fallback with params
    const baseUrl = new URL(fallbackUrl);
    for (const [key, value] of Object.entries(AFFILIATE_PARAMS)) {
      baseUrl.searchParams.set(key, value);
    }
    return baseUrl.toString();
  }
}

/**
 * Check if URL is a specific event link (contains /event/)
 */
function isSpecificEventUrl(url: string | null | undefined): boolean {
  return !!url && url.includes('/event/');
}

/**
 * Search Eventim via Google Custom Search API
 * Returns first result containing /event/
 */
async function searchEventimLink(
  city: string, 
  date: string, 
  apiKey: string, 
  engineId: string
): Promise<string | null> {
  try {
    const query = `site:eventim.de "Antoine Monot" "${city}" Tickets`;
    console.log(`🔍 Google search for ${city}: "${query}"`);
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('cx', engineId);
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('num', '5');
    
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      console.error(`Google API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Search for link with /event/
    for (const item of data.items || []) {
      if (item.link?.includes('/event/')) {
        console.log(`✨ Google found specific URL for ${city}: ${item.link}`);
        return item.link;
      }
    }
    
    console.log(`⚠️ No /event/ URL found in Google results for ${city}`);
    return null;
  } catch (error) {
    console.error(`Google search error for ${city}:`, error);
    return null;
  }
}

async function sendErrorEmail(error: string, step: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('No Resend API key configured, skipping error email');
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Pater Brown Sync <onboarding@resend.dev>',
        to: ['monot@hey.com'],
        subject: `[FEHLER] Tour-Events Sync fehlgeschlagen: ${step}`,
        html: `
          <h2>Sync-Fehler aufgetreten</h2>
          <p><strong>Schritt:</strong> ${step}</p>
          <p><strong>Fehler:</strong></p>
          <pre>${error}</pre>
          <p><strong>Zeitpunkt:</strong> ${new Date().toISOString()}</p>
        `,
      }),
    });
    console.log('Error notification email sent');
  } catch (emailError) {
    console.error('Failed to send error email:', emailError);
  }
}

// Clean city name - remove districts and normalize
function cleanCityName(city: string): string {
  // Map of city variations to clean names
  const cityMap: Record<string, string> = {
    'hamburg / harburg': 'Hamburg',
    'hamburg/harburg': 'Hamburg',
    'münchen / schwanthalerhöhe': 'München',
    'münchen/schwanthalerhöhe': 'München',
    'frankfurt / neu-isenburg': 'Neu-Isenburg',
    'frankfurt a.m.': 'Frankfurt',
    'frankfurt am main': 'Frankfurt',
  };
  
  const lowerCity = city.toLowerCase().trim();
  if (cityMap[lowerCity]) {
    return cityMap[lowerCity];
  }
  
  // Generic cleanup: take first part before / or -
  let cleaned = city.split('/')[0].trim();
  
  // Keep Neu-Isenburg as is (it's a separate city, not a district)
  if (cleaned.toLowerCase().includes('neu-isenburg') || cleaned.toLowerCase().includes('isenburg')) {
    return 'Neu-Isenburg';
  }
  
  return cleaned;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Starting Tour Events Sync with Screenshot ===');
  console.log('🛡️ Protection First + Smart Discovery Mode');

  try {
    const screenshotoneAccessKey = Deno.env.get('SCREENSHOTONE_ACCESS_KEY');
    const screenshotoneSecretKey = Deno.env.get('SCREENSHOTONE_SECRET_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const googleSearchApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const googleSearchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!screenshotoneAccessKey || !screenshotoneSecretKey) {
      throw new Error('ScreenshotOne API keys not configured');
    }

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const googleSearchEnabled = !!(googleSearchApiKey && googleSearchEngineId);
    if (!googleSearchEnabled) {
      console.log('⚠️ Google Search API not configured - Smart Discovery disabled');
    } else {
      console.log('✅ Google Search API configured - Smart Discovery enabled');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use the main pater brown artist page with affiliate tracking
    const eventimUrl = 'https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp';
    console.log('Fetching events from:', eventimUrl);

    // Step 1: Capture full page screenshot
    console.log('Step 1: Capturing full page screenshot...');
    
    const screenshotUrl = new URL('https://api.screenshotone.com/take');
    screenshotUrl.searchParams.set('access_key', screenshotoneAccessKey);
    screenshotUrl.searchParams.set('url', eventimUrl);
    screenshotUrl.searchParams.set('full_page', 'true');
    screenshotUrl.searchParams.set('format', 'png');
    screenshotUrl.searchParams.set('device_scale_factor', '1');
    screenshotUrl.searchParams.set('viewport_width', '1920');
    screenshotUrl.searchParams.set('viewport_height', '1080');
    screenshotUrl.searchParams.set('delay', '5');
    screenshotUrl.searchParams.set('block_ads', 'true');
    screenshotUrl.searchParams.set('block_cookie_banners', 'true');

    const screenshotResponse = await fetch(screenshotUrl.toString());
    
    if (!screenshotResponse.ok) {
      const errorText = await screenshotResponse.text();
      console.error('Screenshot error:', screenshotResponse.status, errorText);
      await sendErrorEmail(`Screenshot failed: ${screenshotResponse.status} - ${errorText}`, 'Screenshot Capture');
      throw new Error(`Screenshot capture failed: ${screenshotResponse.statusText}`);
    }

    const screenshotBuffer = await screenshotResponse.arrayBuffer();
    const uint8Array = new Uint8Array(screenshotBuffer);
    
    // Convert to base64 in chunks
    const chunkSize = 8192;
    let base64Screenshot = '';
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      base64Screenshot += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64Screenshot = btoa(base64Screenshot);
    
    console.log('Screenshot captured successfully, size:', uint8Array.length, 'bytes');

    // Step 2: Extract events with Lovable AI (Gemini Vision)
    console.log('Step 2: Extracting events with Gemini Vision...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `Du extrahierst Tour-Events aus Screenshots. Analysiere ALLE sichtbaren Events.

STÄDTENAMEN - WICHTIG:
- NUR der Hauptstadtname, KEINE Stadtteile!
- "Hamburg / Harburg" → "Hamburg"
- "München / Schwanthalerhöhe" → "München"  
- "Neu-Isenburg" bleibt "Neu-Isenburg" (eigene Stadt)
- "Frankfurt a.M." → "Frankfurt"

Für jedes Event:
- date: "DD.MM.YYYY"
- day: Wochentag (Montag, Dienstag, etc.)
- city: NUR Hauptstadt (siehe oben)
- venue: Vollständiger Venue-Name
- note: "Premiere", "ausverkauft" oder null
- ticket_url: URL falls sichtbar, sonst null (NICHT raten!)

WICHTIG: Wenn du keine spezifische URL siehst, setze ticket_url auf null!

Antworte NUR mit JSON-Array!`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrahiere ALLE Tour-Events für "Pater Brown" aus diesem Screenshot:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Screenshot}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      await sendErrorEmail(`AI extraction failed: ${aiResponse.status} - ${errorText}`, 'AI Extraction');
      throw new Error(`AI extraction failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response preview:', extractedText.substring(0, 500));

    // Parse JSON from AI response
    let events: EventData[] = [];
    try {
      const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/) || 
                       extractedText.match(/```\n([\s\S]*?)\n```/) ||
                       extractedText.match(/\[[\s\S]*\]/);
      
      let jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : extractedText;
      events = JSON.parse(jsonString.trim());
      console.log(`Parsed ${events.length} events from AI`);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', extractedText);
      await sendErrorEmail(`JSON parse error: ${parseError}\n\nRaw: ${extractedText}`, 'JSON Parsing');
      throw new Error('Could not parse event data from AI response');
    }

    // Validate and clean events
    const validEvents: EventData[] = [];
    for (const event of events) {
      if (!event.date || !event.city || !event.venue) {
        console.log('Skipping invalid event:', JSON.stringify(event));
        continue;
      }
      
      // Clean the city name
      event.city = cleanCityName(event.city);
      
      console.log(`Valid event: ${event.date} - ${event.city} - ${event.venue}`);
      validEvents.push(event);
    }

    if (validEvents.length === 0) {
      throw new Error('No valid events could be extracted');
    }

    // Log all found events
    console.log('=== Found Events ===');
    validEvents.forEach((event, i) => {
      console.log(`${i + 1}. ${event.date} - ${event.city} - ${event.venue}`);
    });

    // Step 3: Update database with PROTECTION FIRST logic
    console.log('Step 3: Updating database with Protection First...');

    // Helper to convert DD.MM.YYYY to YYYY-MM-DD
    const convertDateToISO = (dateStr: string): string => {
      const parts = dateStr.split('.');
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    };

    // Mark existing KBA events as inactive (KL events managed separately)
    const { error: deactivateError } = await supabase
      .from('tour_events')
      .update({ is_active: false })
      .eq('is_active', true)
      .or('source.is.null,source.eq.KBA');

    if (deactivateError) {
      console.error('Error deactivating KBA events:', deactivateError);
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let protectedCount = 0;
    let googleFoundCount = 0;

    for (const event of validEvents) {
      const eventDate = convertDateToISO(event.date);
      
      // PROTECTION FIRST: Check for existing event with its ticket_url
      const { data: existing } = await supabase
        .from('tour_events')
        .select('id, ticket_url')
        .eq('event_date', eventDate)
        .eq('city', event.city)
        .maybeSingle();

      let finalTicketUrl: string;

      // === PROTECTION FIRST ===
      if (existing && isSpecificEventUrl(existing.ticket_url)) {
        // 🔒 Protected link - NEVER overwrite
        console.log(`🔒 Keeping existing specific URL for ${event.city}`);
        finalTicketUrl = existing.ticket_url;
        protectedCount++;
        
      } else if (isSpecificEventUrl(event.ticket_url)) {
        // AI found a specific link
        console.log(`✨ AI found specific URL for ${event.city}`);
        finalTicketUrl = event.ticket_url;
        
      } else if (googleSearchEnabled) {
        // === SMART DISCOVERY ===
        console.log(`🔍 Searching Google for ${event.city}...`);
        const googleUrl = await searchEventimLink(
          event.city, 
          event.date, 
          googleSearchApiKey!, 
          googleSearchEngineId!
        );
        
        if (googleUrl) {
          finalTicketUrl = googleUrl;
          googleFoundCount++;
        } else {
          // Fallback to generic link
          console.log(`⚠️ No specific URL found for ${event.city}, using generic`);
          finalTicketUrl = 'https://www.eventim.de/noapp/artist/antoine-monot/';
        }
      } else {
        // No Google Search, use generic fallback
        finalTicketUrl = 'https://www.eventim.de/noapp/artist/antoine-monot/';
      }

      // === AFFILIATE PARAMS ERZWINGEN ===
      finalTicketUrl = ensureAffiliateParams(finalTicketUrl);

      const eventData = {
        date: event.date,
        day: event.day,
        city: event.city,
        venue: event.venue,
        note: event.note || null,
        ticket_url: finalTicketUrl,
        event_date: eventDate,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('tour_events')
          .update(eventData)
          .eq('id', existing.id);
        
        if (updateError) {
          console.error(`Error updating ${event.city}:`, updateError);
        } else {
          console.log(`Updated: ${event.city} - ${event.date} → ${finalTicketUrl.substring(0, 60)}...`);
          updatedCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('tour_events')
          .insert(eventData);
        
        if (insertError) {
          console.error(`Error inserting ${event.city}:`, insertError);
        } else {
          console.log(`Inserted: ${event.city} - ${event.date}`);
          insertedCount++;
        }
      }
    }

    console.log('=== KBA Sync Complete ===');
    console.log(`KBA Total: ${validEvents.length}`);
    console.log(`🔒 Protected: ${protectedCount}`);
    console.log(`🔍 Google Found: ${googleFoundCount}`);
    console.log(`📝 Inserted: ${insertedCount}`);
    console.log(`🔄 Updated: ${updatedCount}`);

    // === Step 4: Sync KL events from admin_events ===
    console.log('Step 4: Syncing KL events from admin_events...');

    let klInserted = 0;
    let klUpdated = 0;
    let klDeactivated = 0;

    // Deactivate all existing KL tour_events first
    const { error: klDeactivateError } = await supabase
      .from('tour_events')
      .update({ is_active: false })
      .eq('source', 'KL')
      .eq('is_active', true);

    if (klDeactivateError) {
      console.error('Error deactivating KL events:', klDeactivateError);
    }

    // Fetch all active KL events from admin_events
    const { data: klEvents, error: klFetchError } = await supabase
      .from('admin_events')
      .select('*')
      .eq('source', 'KL')
      .is('deleted_at', null)
      .order('start_time', { ascending: true });

    if (klFetchError) {
      console.error('Error fetching KL events:', klFetchError);
    } else if (klEvents && klEvents.length > 0) {
      console.log(`Found ${klEvents.length} KL events in admin_events`);

      const dayNames: Record<string, string> = {
        '0': 'Sonntag', '1': 'Montag', '2': 'Dienstag', '3': 'Mittwoch',
        '4': 'Donnerstag', '5': 'Freitag', '6': 'Samstag',
      };

      for (const klEvent of klEvents) {
        const startDate = new Date(klEvent.start_time);
        const eventDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const dd = String(startDate.getDate()).padStart(2, '0');
        const mm = String(startDate.getMonth() + 1).padStart(2, '0');
        const yyyy = startDate.getFullYear();
        const dateStr = `${dd}.${mm}.${yyyy}`;
        const dayName = dayNames[String(startDate.getDay())];
        const hours = String(startDate.getHours()).padStart(2, '0');
        const mins = String(startDate.getMinutes()).padStart(2, '0');
        const dayDisplay = `${dayName.substring(0, 2)}. ${hours}:${mins}`;

        // Nur freigegebene ticket_url verwenden - kein Fallback auf venue_url
        const ticketUrl = (klEvent.ticket_url_approved && klEvent.ticket_url)
          ? klEvent.ticket_url
          : null;

        const tourEventData = {
          date: dateStr,
          day: dayDisplay,
          city: klEvent.location,
          venue: klEvent.venue_name || klEvent.location,
          note: klEvent.note || null,
          ticket_url: ticketUrl,
          event_date: eventDate,
          is_active: true,
          source: 'KL',
          latitude: klEvent.latitude,
          longitude: klEvent.longitude,
          last_synced_at: new Date().toISOString(),
        };

        // Check if this KL event already exists in tour_events
        const { data: existingKl } = await supabase
          .from('tour_events')
          .select('id')
          .eq('event_date', eventDate)
          .eq('city', klEvent.location)
          .eq('source', 'KL')
          .maybeSingle();

        if (existingKl) {
          const { error: updateErr } = await supabase
            .from('tour_events')
            .update(tourEventData)
            .eq('id', existingKl.id);
          if (!updateErr) {
            klUpdated++;
            console.log(`KL Updated: ${klEvent.location} - ${dateStr}`);
          }
        } else {
          const { error: insertErr } = await supabase
            .from('tour_events')
            .insert(tourEventData);
          if (!insertErr) {
            klInserted++;
            console.log(`KL Inserted: ${klEvent.location} - ${dateStr}`);
          }
        }
      }
    } else {
      console.log('No KL events found in admin_events');
    }

    console.log('=== Full Sync Complete ===');
    console.log(`KBA: ${validEvents.length} (${insertedCount} new, ${updatedCount} updated, ${protectedCount} protected)`);
    console.log(`KL: ${klEvents?.length || 0} (${klInserted} new, ${klUpdated} updated)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${validEvents.length} KBA + ${klEvents?.length || 0} KL events`,
        kba: {
          eventsFound: validEvents.length,
          inserted: insertedCount,
          updated: updatedCount,
          protected: protectedCount,
          googleFound: googleFoundCount,
        },
        kl: {
          eventsFound: klEvents?.length || 0,
          inserted: klInserted,
          updated: klUpdated,
        },
        events: validEvents,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await sendErrorEmail(errorMessage, 'Main Process');

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
