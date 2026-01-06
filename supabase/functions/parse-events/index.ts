import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Du bist ein Event-Daten-Extraktor für Theatertour-Termine. Analysiere den gegebenen Text und extrahiere alle Termine.

Für jeden Termin gib ein JSON-Objekt zurück mit:
- date: Datum im Format YYYY-MM-DD
- start_time: Startzeit im Format HH:MM (24h) - WICHTIG: "19.30 Uhr" wird zu "19:30", "20 Uhr" zu "20:00"
- end_time: Endzeit im Format HH:MM (24h), falls vorhanden, sonst null
- city: Name der Stadt EXAKT wie angegeben - WICHTIG: Ortszusätze beibehalten!
  - "Homberg (Efze)" NICHT zu "Homberg" kürzen
  - "Neustadt / Holstein" NICHT zu "Neustadt" kürzen
  - "Bad Oeynhausen" vollständig übernehmen
  - Wenn eine PLZ angegeben ist (z.B. "D 23730 NEUSTADT / HOLSTEIN"), nutze diese zur Identifikation!
- state: PFLICHTFELD! Das deutsche Bundesland der Stadt. Nutze PLZ-Bereiche zur korrekten Zuordnung:
  - PLZ 23xxx = Schleswig-Holstein (z.B. 23730 Neustadt/Holstein)
  - PLZ 67xxx = Rheinland-Pfalz (z.B. 67433 Neustadt an der Weinstraße)
  - PLZ 34xxx = Hessen (z.B. 34576 Homberg/Efze)
  - PLZ 58xxx = Nordrhein-Westfalen
  - PLZ 83xxx = Bayern
  - PLZ 79xxx = Baden-Württemberg
  - PLZ 25xxx-27xxx = Schleswig-Holstein/Niedersachsen
  Dies ist IMMER erforderlich und darf NIEMALS null sein!
- latitude: PFLICHTFELD! Breitengrad der Stadt im Dezimalformat. Nutze die PLZ für exakte Zuordnung!
- longitude: PFLICHTFELD! Längengrad der Stadt im Dezimalformat. Nutze die PLZ für exakte Zuordnung!
- venue: Name des Veranstaltungsortes, falls vorhanden (z.B. "Bürgerhaus", "Stadthalle", "Theater im Park")
- venue_address: Adresse des Veranstaltungsortes, falls vorhanden
- venue_url: URL zum Veranstaltungsort, falls vorhanden
- note: Wichtige Anmerkungen, Sonderinfos oder Gebietsausschlüsse (vollständig übernehmen!)
- source: Quelle/Veranstalter - erkenne anhand der Daten:
  - "KL" = Konzertdirektion Landgraf
  - "KBA" = Künstlerbüro Albrecht / Konzertbüro Augsburg
  - "unknown" = nicht erkennbar

KRITISCH - ZEITFORMATE:
- "19.30 Uhr" → "19:30" (Punkt zu Doppelpunkt!)
- "20.00 Uhr" → "20:00"
- "20 Uhr" → "20:00"
- "19:30-22:00 Uhr" → start_time: "19:30", end_time: "22:00"

KRITISCH - ORTE MIT GLEICHEM NAMEN:
Verschiedene deutsche Städte haben gleiche Namen! Nutze IMMER die PLZ zur Unterscheidung:
- 23730 = Neustadt in Holstein (Schleswig-Holstein) - Koordinaten: 54.107, 10.815
- 67433 = Neustadt an der Weinstraße (Rheinland-Pfalz) - Koordinaten: 49.35, 8.14
- 34576 = Homberg (Efze) (Hessen) - Koordinaten: 51.03, 9.40

Antworte NUR mit einem JSON-Array der extrahierten Events, keine weiteren Erklärungen.
Beispiel:
[{"date":"2026-11-25","start_time":"19:30","end_time":null,"city":"Schwalbach","state":"Hessen","latitude":50.15,"longitude":8.53,"venue":"Bürgerhaus","venue_address":"Marktplatz 1-2","note":null,"source":"KL"}]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extrahiere alle Termine aus folgendem Text:\n\n${content}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    console.log("AI Response:", aiResponse);

    // Parse the JSON response
    let events = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0]);
      } else {
        events = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Could not parse AI response", raw: aiResponse }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and clean up events - include latitude/longitude!
    const validatedEvents = events.map((event: any) => ({
      date: event.date || "",
      start_time: event.start_time ? event.start_time.replace(".", ":") : "20:00", // Fix "19.30" → "19:30"
      end_time: event.end_time ? event.end_time.replace(".", ":") : null,
      city: event.city || "",
      state: event.state || null,
      latitude: event.latitude || null,
      longitude: event.longitude || null,
      venue: event.venue || null,
      venue_url: event.venue_url || null,
      note: event.note || null,
      source: ["KL", "KBA", "unknown"].includes(event.source) ? event.source : "unknown",
    })).filter((e: any) => e.date && e.city);

    return new Response(
      JSON.stringify({ events: validatedEvents, count: validatedEvents.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("parse-events error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
