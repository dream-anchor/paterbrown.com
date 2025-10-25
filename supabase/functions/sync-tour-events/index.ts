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
  latitude?: number;
  longitude?: number;
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
      const error = 'ScreenshotOne API keys not configured';
      await sendErrorEmail(error, 'Configuration Check');
      throw new Error(error);
    }

    if (!lovableApiKey) {
      const error = 'Lovable API key not configured';
      await sendErrorEmail(error, 'Configuration Check');
      throw new Error(error);
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Step 1: Capture screenshot using ScreenshotOne
    console.log('Capturing screenshot from Eventim...');
    const eventimUrl = 'https://www.eventim.de/noapp/artist/antoine-monot/';
    
    const screenshotUrl = new URL('https://api.screenshotone.com/take');
    screenshotUrl.searchParams.set('access_key', screenshotoneAccessKey);
    screenshotUrl.searchParams.set('url', eventimUrl);
    screenshotUrl.searchParams.set('full_page', 'true');
    screenshotUrl.searchParams.set('format', 'png');
    screenshotUrl.searchParams.set('device_scale_factor', '1');
    screenshotUrl.searchParams.set('viewport_width', '1920');
    screenshotUrl.searchParams.set('viewport_height', '1080');

    const screenshotResponse = await fetch(screenshotUrl.toString());
    
    if (!screenshotResponse.ok) {
      const error = `Screenshot capture failed: ${screenshotResponse.statusText}`;
      await sendErrorEmail(error, 'Screenshot Capture');
      throw new Error(error);
    }

    const screenshotBuffer = await screenshotResponse.arrayBuffer();
    const base64Screenshot = btoa(String.fromCharCode(...new Uint8Array(screenshotBuffer)));
    
    console.log('Screenshot captured successfully');

    // Step 2: Extract event data using Lovable AI (Gemini Vision)
    console.log('Extracting event data with Gemini Vision...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Du bist ein Datenextraktions-Assistent. Extrahiere alle Tour-Events aus dem Screenshot einer Eventim-Seite. 
            
Für jedes Event extrahiere:
- date: Das Datum im Format "DD.MM.YYYY"
- day: Der Wochentag (z.B. "Freitag", "Samstag")
- city: Die Stadt
- venue: Der Veranstaltungsort/Location
- note: Optionale Hinweise (z.B. "Premiere", "ausverkauft", "verlegt")
- ticket_url: Die vollständige Eventim-URL zum Event

Gebe die Daten als JSON-Array zurück. Beispiel:
[
  {
    "date": "15.03.2025",
    "day": "Samstag",
    "city": "Berlin",
    "venue": "Admiralspalast",
    "note": "Premiere",
    "ticket_url": "https://www.eventim.de/event/..."
  }
]`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrahiere alle Tour-Events aus diesem Screenshot der Eventim-Seite:'
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
      const error = `AI extraction failed: ${aiResponse.statusText} - ${errorText}`;
      await sendErrorEmail(error, 'AI Data Extraction');
      throw new Error(error);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', extractedText);

    // Parse the JSON from the AI response
    let events: EventData[] = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/) || 
                       extractedText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, extractedText];
      const jsonString = jsonMatch[1] || extractedText;
      events = JSON.parse(jsonString.trim());
      console.log(`Extracted ${events.length} events`);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      const error = `Could not parse event data from AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
      await sendErrorEmail(error, 'JSON Parsing');
      throw new Error(error);
    }

    // Step 3: Update the database
    console.log('Updating database...');
    
    // Mark all existing events as inactive first
    await supabase
      .from('tour_events')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert or update events
    for (const event of events) {
      const eventData = {
        date: event.date,
        day: event.day,
        city: event.city,
        venue: event.venue,
        note: event.note || null,
        ticket_url: event.ticket_url,
        eventim_event_id: event.eventim_event_id || null,
        latitude: event.latitude || null,
        longitude: event.longitude || null,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      };

      // Try to find existing event by date, city, and venue
      const { data: existing } = await supabase
        .from('tour_events')
        .select('id')
        .eq('date', event.date)
        .eq('city', event.city)
        .eq('venue', event.venue)
        .single();

      if (existing) {
        // Update existing event
        await supabase
          .from('tour_events')
          .update(eventData)
          .eq('id', existing.id);
        console.log(`Updated event: ${event.city} - ${event.date}`);
      } else {
        // Insert new event
        await supabase
          .from('tour_events')
          .insert(eventData);
        console.log(`Inserted new event: ${event.city} - ${event.date}`);
      }
    }

    console.log('Sync completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${events.length} events`,
        events 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in sync-tour-events:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    // Send error email if not already sent
    if (!errorMsg.includes('not configured')) {
      await sendErrorEmail(errorMsg, 'General Error');
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
