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
- start_time: Startzeit im Format HH:MM (24h)
- end_time: Endzeit im Format HH:MM (24h), falls vorhanden, sonst null
- city: Name der Stadt (nur der Hauptort, z.B. "Hamburg" statt "Hamburg-Harburg")
- state: PFLICHTFELD! Das deutsche Bundesland der Stadt. Nutze dein Wissen über deutsche Geografie:
  - Hamburg → "Hamburg"
  - Berlin → "Berlin"
  - Bremen → "Bremen"
  - München → "Bayern"
  - Nürnberg → "Bayern"
  - Frankfurt → "Hessen"
  - Köln → "Nordrhein-Westfalen"
  - Düsseldorf → "Nordrhein-Westfalen"
  - Stuttgart → "Baden-Württemberg"
  - Hannover → "Niedersachsen"
  - Dresden → "Sachsen"
  - Leipzig → "Sachsen"
  Dies ist IMMER erforderlich und darf NIEMALS null sein!
- latitude: PFLICHTFELD! Breitengrad der Stadt im Dezimalformat (z.B. 53.5511 für Hamburg). Recherchiere die genauen Koordinaten!
- longitude: PFLICHTFELD! Längengrad der Stadt im Dezimalformat (z.B. 9.9937 für Hamburg). Recherchiere die genauen Koordinaten!
- venue: Name des Veranstaltungsortes, falls vorhanden
- venue_url: URL zum Veranstaltungsort, falls vorhanden
- note: Wichtige Anmerkungen, falls vorhanden
- source: Quelle/Veranstalter - erkenne anhand der Daten:
  - "KL" = Konzertdirektion Landgraf
  - "KBA" = Künstlerbüro Albrecht
  - "unknown" = nicht erkennbar

WICHTIG:
- Bei deutschen Datumsformaten (z.B. 08.01.2026) ins ISO-Format konvertieren
- Zeitangaben wie "20 Uhr" zu "20:00" konvertieren
- Wenn du unsicher über die Quelle bist, setze "unknown"
- Das Bundesland (state) MUSS für jede deutsche Stadt ermittelt werden!
- Die Koordinaten (latitude, longitude) MÜSSEN für jede Stadt recherchiert werden!

Antworte NUR mit einem JSON-Array der extrahierten Events, keine weiteren Erklärungen.
Beispiel-Antwort:
[{"date":"2026-01-08","start_time":"20:00","end_time":null,"city":"Hamburg","state":"Hamburg","venue":"Friedrich-Ebert-Halle","venue_url":null,"note":null,"source":"KL"}]`;

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

    // Validate and clean up events
    const validatedEvents = events.map((event: any) => ({
      date: event.date || "",
      start_time: event.start_time || "20:00",
      end_time: event.end_time || null,
      city: event.city || "",
      state: event.state || null,
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
