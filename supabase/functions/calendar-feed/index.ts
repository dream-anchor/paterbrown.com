import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "ics";

    // Create Supabase client with service role for unrestricted access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all events
    const { data: events, error } = await supabase
      .from("admin_events")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to fetch events");
    }

    if (format === "ics") {
      // Generate iCal format
      const icalContent = generateICalendar(events || []);
      
      return new Response(icalContent, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'attachment; filename="pater-brown-tour.ics"',
        },
      });
    }

    // Return JSON for other formats
    return new Response(
      JSON.stringify({ events }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("calendar-feed error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateICalendar(events: any[]): string {
  const now = new Date();
  const timestamp = formatICalDate(now);

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pater Brown Tour//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Pater Brown Tour
X-WR-TIMEZONE:Europe/Berlin
`;

  for (const event of events) {
    const startTime = new Date(event.start_time);
    const endTime = event.end_time 
      ? new Date(event.end_time) 
      : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const uid = `${event.id}@paterbrown.com`;
    const summary = escapeICalText(event.title);
    const location = event.venue_name 
      ? escapeICalText(`${event.venue_name}, ${event.location}`)
      : escapeICalText(event.location);
    
    let description = `TOUR PB`;
    if (event.source !== "unknown") {
      description += ` (${event.source})`;
    }
    if (event.note) {
      description += `\\n\\nAnmerkung: ${event.note}`;
    }
    if (event.venue_url) {
      description += `\\n\\nMehr Infos: ${event.venue_url}`;
    }

    ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${timestamp}
DTSTART:${formatICalDate(startTime)}
DTEND:${formatICalDate(endTime)}
SUMMARY:${summary}
LOCATION:${location}
DESCRIPTION:${escapeICalText(description)}
STATUS:CONFIRMED
END:VEVENT
`;
  }

  ical += "END:VCALENDAR";
  return ical;
}

function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
