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

  try {
    const screenshotoneAccessKey = Deno.env.get('SCREENSHOTONE_ACCESS_KEY');
    const screenshotoneSecretKey = Deno.env.get('SCREENSHOTONE_SECRET_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!screenshotoneAccessKey || !screenshotoneSecretKey) {
      throw new Error('ScreenshotOne API keys not configured');
    }

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
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
- ticket_url: URL falls sichtbar, sonst "https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp"

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
      
      // Ensure valid ticket URL with affiliate tracking
      if (!event.ticket_url || !event.ticket_url.startsWith('http')) {
        event.ticket_url = 'https://www.eventim.de/noapp/artist/antoine-monot/?affiliate=KZB&utm_campaign=KBA&utm_source=KZB&utm_medium=dp';
      }
      
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

    // Step 3: Update database
    console.log('Step 3: Updating database...');

    // Helper to convert DD.MM.YYYY to YYYY-MM-DD
    const convertDateToISO = (dateStr: string): string => {
      const parts = dateStr.split('.');
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    };

    // Mark all existing events as inactive
    const { error: deactivateError } = await supabase
      .from('tour_events')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Error deactivating events:', deactivateError);
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const event of validEvents) {
      const eventDate = convertDateToISO(event.date);
      
      const eventData = {
        date: event.date,
        day: event.day,
        city: event.city,
        venue: event.venue,
        note: event.note || null,
        ticket_url: event.ticket_url,
        event_date: eventDate,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      };

      // Check for existing event
      const { data: existing } = await supabase
        .from('tour_events')
        .select('id')
        .eq('event_date', eventDate)
        .eq('city', event.city)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('tour_events')
          .update(eventData)
          .eq('id', existing.id);
        
        if (updateError) {
          console.error(`Error updating ${event.city}:`, updateError);
        } else {
          console.log(`Updated: ${event.city} - ${event.date}`);
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

    console.log('=== Sync Complete ===');
    console.log(`Total: ${validEvents.length}, Inserted: ${insertedCount}, Updated: ${updatedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${validEvents.length} events (${insertedCount} new, ${updatedCount} updated)`,
        eventsFound: validEvents.length,
        inserted: insertedCount,
        updated: updatedCount,
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
