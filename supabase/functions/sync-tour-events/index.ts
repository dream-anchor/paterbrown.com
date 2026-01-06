import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  eventim_event_id?: string;
}

async function sendErrorEmail(error: string, step: string) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured, skipping error email');
      return;
    }

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: 'Pater Brown Sync <onboarding@resend.dev>',
      to: ['monot@hey.com'],
      subject: '🚨 Tour Events Sync fehlgeschlagen',
      html: `
        <h1>Tour Events Synchronisation Fehler</h1>
        <p><strong>Zeitstempel:</strong> ${new Date().toISOString()}</p>
        <p><strong>Fehlgeschlagener Schritt:</strong> ${step}</p>
        <p><strong>Fehlermeldung:</strong></p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${error}</pre>
      `,
    });
    console.log('Error email sent successfully to monot@hey.com');
  } catch (emailError) {
    console.error('Failed to send error email:', emailError);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting tour events sync...');

    const screenshotoneAccessKey = Deno.env.get('SCREENSHOTONE_ACCESS_KEY');
    const screenshotoneSecretKey = Deno.env.get('SCREENSHOTONE_SECRET_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!screenshotoneAccessKey || !screenshotoneSecretKey) {
      throw new Error('ScreenshotOne API keys not configured');
    }

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Step 1: Capture FULL PAGE screenshot using ScreenshotOne
    console.log('Capturing full page screenshot from Eventim...');
    const eventimUrl = 'https://www.eventim.de/noapp/artist/antoine-monot/';
    
    const screenshotUrl = new URL('https://api.screenshotone.com/take');
    screenshotUrl.searchParams.set('access_key', screenshotoneAccessKey);
    screenshotUrl.searchParams.set('url', eventimUrl);
    screenshotUrl.searchParams.set('full_page', 'true');
    screenshotUrl.searchParams.set('format', 'png');
    screenshotUrl.searchParams.set('device_scale_factor', '1');
    screenshotUrl.searchParams.set('viewport_width', '1920');
    screenshotUrl.searchParams.set('viewport_height', '1080');
    screenshotUrl.searchParams.set('delay', '3'); // Wait for page to fully load
    screenshotUrl.searchParams.set('block_ads', 'true');
    screenshotUrl.searchParams.set('block_cookie_banners', 'true');

    const screenshotResponse = await fetch(screenshotUrl.toString());
    
    if (!screenshotResponse.ok) {
      const errorText = await screenshotResponse.text();
      console.error('Screenshot error:', screenshotResponse.status, errorText);
      throw new Error(`Screenshot capture failed: ${screenshotResponse.statusText}`);
    }

    const screenshotBuffer = await screenshotResponse.arrayBuffer();
    
    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(screenshotBuffer);
    const chunkSize = 8192;
    let base64Screenshot = '';
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      base64Screenshot += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64Screenshot = btoa(base64Screenshot);
    
    console.log('Screenshot captured successfully, size:', uint8Array.length, 'bytes');

    // Step 2: Extract event data using Lovable AI (Gemini Vision)
    console.log('Extracting event data with Gemini Vision...');
    
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
            content: `Du bist ein Experte für die Extraktion von Tour-Daten aus Screenshots. 
            
Analysiere den Screenshot der Eventim-Seite und extrahiere ALLE sichtbaren Tour-Events für "Pater Brown - Der Fluch der Marvelin".

SEHR WICHTIG:
- Extrahiere JEDES Event das du siehst - es können 4-8 oder mehr Events sein!
- Lies das Datum genau ab - das Jahr ist wahrscheinlich 2025 oder 2026
- Achte genau auf die Venue-Namen - jede Stadt hat einen anderen Venue!

STÄDTENAMEN REGELN:
- Verwende NUR den Hauptstadtnamen, KEINE Stadtteile oder Zusätze!
- RICHTIG: "Hamburg", "München", "Frankfurt"
- FALSCH: "Hamburg / Harburg", "München / Schwanthalerhöhe", "Frankfurt a.M."
- Bei "Neu-Isenburg" schreibe einfach "Neu-Isenburg" (das ist eine eigenständige Stadt)

Für jedes Event extrahiere:
- date: Datum im Format "DD.MM.YYYY" (z.B. "18.02.2026")
- day: Wochentag auf Deutsch (Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag)
- city: Nur die Stadt ohne Stadtteil (z.B. "Hamburg", "Bremen", "München", "Zürich")
- venue: Location/Veranstaltungsort (z.B. "Friedrich-Ebert-Halle", "Alte Kongresshalle")
- note: Hinweise wie "Premiere", "ausverkauft", "verlegt" oder null
- ticket_url: Eventim-URL falls sichtbar, sonst "https://www.eventim.de/noapp/artist/antoine-monot/"

Antworte NUR mit einem JSON-Array, keine Erklärungen!
Beispiel: [{"date":"18.02.2026","day":"Mittwoch","city":"Hamburg","venue":"Friedrich-Ebert-Halle","note":null,"ticket_url":"https://www.eventim.de/noapp/artist/antoine-monot/"}]`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrahiere ALLE Tour-Events aus diesem Screenshot. Achte genau auf jede Stadt und jeden Venue:'
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
      throw new Error(`AI extraction failed: ${aiResponse.statusText} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', extractedText);

    // Parse the JSON from the AI response
    let events: EventData[] = [];
    try {
      const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/) || 
                       extractedText.match(/```\n([\s\S]*?)\n```/) ||
                       extractedText.match(/\[[\s\S]*\]/);
      
      let jsonString = '';
      if (jsonMatch) {
        jsonString = jsonMatch[1] || jsonMatch[0];
      } else {
        jsonString = extractedText;
      }
      
      events = JSON.parse(jsonString.trim());
      console.log(`Extracted ${events.length} events from AI`);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', extractedText);
      throw new Error(`Could not parse event data from AI response`);
    }

    // Validate each event
    console.log('Validating extracted events...');
    const validEvents: EventData[] = [];
    for (const event of events) {
      if (!event.date || !event.city || !event.venue) {
        console.log(`Skipping invalid event: ${JSON.stringify(event)}`);
        continue;
      }
      
      // Ensure ticket_url is valid
      if (!event.ticket_url || !event.ticket_url.startsWith('http')) {
        event.ticket_url = `https://www.eventim.de/noapp/artist/antoine-monot/`;
      }
      
      console.log(`Valid event: ${event.date} - ${event.city} - ${event.venue}`);
      validEvents.push(event);
    }

    if (validEvents.length === 0) {
      throw new Error('No valid events could be extracted');
    }

    // Step 3: Update the database
    console.log('Updating database with', validEvents.length, 'events...');
    
    // Helper function to convert DD.MM.YYYY to YYYY-MM-DD
    const convertDateToISO = (dateStr: string): string => {
      const parts = dateStr.split('.');
      if (parts.length !== 3) return dateStr;
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    // Mark all existing events as inactive first
    const { error: deactivateError } = await supabase
      .from('tour_events')
      .update({ is_active: false })
      .eq('is_active', true);
    
    if (deactivateError) {
      console.error('Error deactivating events:', deactivateError);
    }

    // Insert or update events
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
        eventim_event_id: event.eventim_event_id || null,
        event_date: eventDate,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      };

      // Try to find existing event by event_date and city
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
          console.error(`Error updating event ${event.city}:`, updateError);
        } else {
          console.log(`Updated event: ${event.city} - ${event.date}`);
          updatedCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('tour_events')
          .insert(eventData);
        
        if (insertError) {
          console.error(`Error inserting event ${event.city}:`, insertError);
        } else {
          console.log(`Inserted new event: ${event.city} - ${event.date}`);
          insertedCount++;
        }
      }
    }

    console.log(`Sync completed: ${insertedCount} inserted, ${updatedCount} updated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${validEvents.length} events (${insertedCount} new, ${updatedCount} updated)`,
        events: validEvents
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in sync-tour-events:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    if (!errorMsg.includes('not configured')) {
      try {
        await sendErrorEmail(errorMsg, 'General Error');
      } catch (emailError) {
        console.error('Failed to send error notification email:', emailError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMsg,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
