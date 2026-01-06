import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all events with missing coordinates or state
    const { data: events, error: fetchError } = await supabase
      .from("admin_events")
      .select("id, location, state, latitude, longitude")
      .or("latitude.is.null,longitude.is.null,state.is.null");

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: "Keine Events mit fehlenden Geodaten gefunden", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${events.length} events with missing geodata`);

    // Get unique cities that need geocoding
    const citiesToGeocode = [...new Set(events.map(e => e.location))];
    console.log(`Unique cities to geocode: ${citiesToGeocode.join(", ")}`);

    // Use Lovable AI to get coordinates and states for all cities
    const prompt = `Du bist ein Geocoding-Experte für deutsche Städte und Orte.

Für die folgenden deutschen Orte, gib mir die exakten Koordinaten (latitude/longitude) und das Bundesland.

Orte:
${citiesToGeocode.map((city, i) => `${i + 1}. ${city}`).join("\n")}

WICHTIG:
- Recherchiere die EXAKTEN Koordinaten für jeden Ort (Stadtzentrum)
- Gib das korrekte Bundesland an
- Bei unbekannten Orten versuche, sie anhand des Namens zu lokalisieren
- Schwalbach = Schwalbach am Taunus (Hessen)
- Schüttorf = Stadt in Niedersachsen

Antworte NUR mit einem JSON-Array, keine weiteren Erklärungen:
[
  {
    "city": "Originalname wie in der Liste",
    "latitude": 50.1234,
    "longitude": 8.5678,
    "state": "Bundesland"
  }
]`;

    console.log("Calling Lovable AI for geocoding...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Du bist ein präziser Geocoding-Assistent. Antworte nur mit validem JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("Empty response from AI");
    }

    console.log("AI response received:", aiContent.substring(0, 500));

    // Parse the JSON from AI response
    let geocodedCities: Array<{
      city: string;
      latitude: number;
      longitude: number;
      state: string;
    }>;

    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in AI response");
      }
      geocodedCities = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error(`Failed to parse geocoding results: ${parseError}`);
    }

    console.log(`Parsed ${geocodedCities.length} geocoded cities`);

    // Update events in database
    let updatedCount = 0;
    const errors: string[] = [];

    for (const cityData of geocodedCities) {
      // Find events matching this city
      const matchingEvents = events.filter(e => e.location === cityData.city);
      
      for (const event of matchingEvents) {
        const { error: updateError } = await supabase
          .from("admin_events")
          .update({
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            state: cityData.state,
          })
          .eq("id", event.id);

        if (updateError) {
          errors.push(`Failed to update event ${event.id}: ${updateError.message}`);
          console.error(`Update error for event ${event.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Updated event ${event.id} with coords: ${cityData.latitude}, ${cityData.longitude}, state: ${cityData.state}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `${updatedCount} Events aktualisiert`,
        updated: updatedCount,
        total: events.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in geocode-events function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
