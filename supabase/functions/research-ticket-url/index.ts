import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchRequest {
  event_id: string;
  venue_name?: string;
  city?: string;
  venue_url?: string;
}

/**
 * Research ticket URL for a KL event using Google Search + AI analysis.
 * Searches for the venue's ticket page for Pater Brown.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_id, venue_name, city, venue_url } = (await req.json()) as ResearchRequest;

    if (!event_id) {
      return new Response(
        JSON.stringify({ error: "event_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const googleSearchApiKey = Deno.env.get("GOOGLE_SEARCH_API_KEY");
    const googleSearchEngineId = Deno.env.get("GOOGLE_SEARCH_ENGINE_ID");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If no venue_name/city provided, fetch from DB
    let searchVenue = venue_name;
    let searchCity = city;
    let searchVenueUrl = venue_url;

    if (!searchVenue || !searchCity) {
      const { data: event } = await supabase
        .from("admin_events")
        .select("venue_name, location, venue_url")
        .eq("id", event_id)
        .single();

      if (event) {
        searchVenue = searchVenue || event.venue_name || "";
        searchCity = searchCity || event.location || "";
        searchVenueUrl = searchVenueUrl || event.venue_url || "";
      }
    }

    if (!searchVenue && !searchCity) {
      return new Response(
        JSON.stringify({ error: "Could not determine venue/city for search" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Research] Searching ticket URL for: ${searchVenue} in ${searchCity}`);

    let foundUrl: string | null = null;
    let confidence: "high" | "medium" | "low" = "low";
    let sourceDescription = "";

    // Strategy 0: Direkt die Venue-Website crawlen und nach Pater Brown Links suchen
    if (searchVenueUrl && !foundUrl) {
      try {
        console.log(`[Research] Strategy 0 - Direct venue crawl: ${searchVenueUrl}`);
        const crawlResult = await crawlVenueWebsite(searchVenueUrl);
        if (crawlResult) {
          foundUrl = crawlResult;
          confidence = "high";
          sourceDescription = `Direkt auf Venue-Website gefunden`;
          console.log(`[Research] Found via direct crawl: ${foundUrl}`);
        }
      } catch (e) {
        console.log(`[Research] Direct crawl failed: ${e}`);
      }
    }

    // Strategy 1: Search venue website directly if venue_url is available
    if (!foundUrl && searchVenueUrl && googleSearchApiKey && googleSearchEngineId) {
      try {
        const domain = new URL(searchVenueUrl).hostname;
        const query = `site:${domain} "Pater Brown" Tickets`;
        console.log(`[Research] Strategy 1 - Site search: ${query}`);

        const result = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
        if (result) {
          foundUrl = result;
          confidence = "high";
          sourceDescription = `Gefunden auf ${domain}`;
          console.log(`[Research] Found via site search: ${foundUrl}`);
        }
      } catch (e) {
        console.log(`[Research] Site search failed: ${e}`);
      }
    }

    // Strategy 2: General Google search for Pater Brown at venue
    if (!foundUrl && googleSearchApiKey && googleSearchEngineId) {
      const query = `"Pater Brown" "${searchVenue}" "${searchCity}" Tickets Karten`;
      console.log(`[Research] Strategy 2 - General search: ${query}`);

      const result = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
      if (result) {
        foundUrl = result;
        confidence = "medium";
        sourceDescription = "Gefunden via Google-Suche";
        console.log(`[Research] Found via general search: ${foundUrl}`);
      }
    }

    // Strategy 3: Search for venue's Spielplan/Vorverkauf
    if (!foundUrl && googleSearchApiKey && googleSearchEngineId) {
      const query = `"${searchVenue}" "${searchCity}" Spielplan Vorverkauf Tickets`;
      console.log(`[Research] Strategy 3 - Venue program search: ${query}`);

      const result = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
      if (result) {
        foundUrl = result;
        confidence = "low";
        sourceDescription = "Spielplan/VVK-Seite des Venues gefunden";
        console.log(`[Research] Found via program search: ${foundUrl}`);
      }
    }

    // Strategy 4: Use AI to analyze search results and pick best URL
    if (!foundUrl && lovableApiKey && googleSearchApiKey && googleSearchEngineId) {
      console.log("[Research] Strategy 4 - AI analysis of search results");

      const query = `"Pater Brown" Live-Hörspiel "${searchCity}" Tickets`;
      const searchResults = await googleSearchFull(query, googleSearchApiKey, googleSearchEngineId);

      if (searchResults.length > 0) {
        const aiResult = await aiAnalyzeResults(searchResults, searchVenue!, searchCity!, lovableApiKey);
        if (aiResult) {
          foundUrl = aiResult;
          confidence = "medium";
          sourceDescription = "AI-Analyse der Suchergebnisse";
          console.log(`[Research] AI found: ${foundUrl}`);
        }
      }
    }

    // Save to admin_events if found
    if (foundUrl) {
      const { error: updateError } = await supabase
        .from("admin_events")
        .update({ ticket_url: foundUrl })
        .eq("id", event_id);

      if (updateError) {
        console.error("[Research] Error saving ticket_url:", updateError);
      } else {
        console.log(`[Research] Saved ticket_url for event ${event_id}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket_url: foundUrl,
        confidence,
        source_description: sourceDescription || (foundUrl ? "Gefunden" : "Kein Ticket-Link gefunden"),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Research] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Google Custom Search - returns first relevant URL
 */
async function googleSearch(query: string, apiKey: string, engineId: string): Promise<string | null> {
  const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
  searchUrl.searchParams.set("key", apiKey);
  searchUrl.searchParams.set("cx", engineId);
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("num", "5");

  const response = await fetch(searchUrl.toString());
  if (!response.ok) return null;

  const data = await response.json();
  const items = data.items || [];

  // Prefer URLs with ticket/karten/vorverkauf in the path
  const ticketKeywords = ["/ticket", "/karten", "/vorverkauf", "/veranstaltung", "/event", "/programm"];
  for (const item of items) {
    const url = item.link?.toLowerCase() || "";
    if (ticketKeywords.some((kw) => url.includes(kw))) {
      return item.link;
    }
  }

  // Fallback: return first result if it's from a theater/venue domain
  if (items.length > 0 && !items[0].link?.includes("facebook.com") && !items[0].link?.includes("wikipedia.org")) {
    return items[0].link;
  }

  return null;
}

/**
 * Google Custom Search - returns full results for AI analysis
 */
async function googleSearchFull(
  query: string,
  apiKey: string,
  engineId: string
): Promise<Array<{ title: string; link: string; snippet: string }>> {
  const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
  searchUrl.searchParams.set("key", apiKey);
  searchUrl.searchParams.set("cx", engineId);
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("num", "10");

  const response = await fetch(searchUrl.toString());
  if (!response.ok) return [];

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    title: item.title || "",
    link: item.link || "",
    snippet: item.snippet || "",
  }));
}

/**
 * Use AI to analyze search results and pick the best ticket URL
 */
async function aiAnalyzeResults(
  results: Array<{ title: string; link: string; snippet: string }>,
  venue: string,
  city: string,
  apiKey: string
): Promise<string | null> {
  const resultsText = results
    .map((r, i) => `${i + 1}. [${r.title}](${r.link})\n   ${r.snippet}`)
    .join("\n\n");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `Du bist ein Assistent der Ticket-Links für Theaterveranstaltungen findet.
Analysiere die Suchergebnisse und finde die URL, über die man Tickets für "Pater Brown - Das Live-Hörspiel" kaufen kann.

Regeln:
- Bevorzuge direkte Ticket-/Karten-Links (mit /ticket, /karten, /vorverkauf im Pfad)
- Bevorzuge die offizielle Venue-Website gegenüber Drittanbietern
- Ignoriere Social-Media-Links, Wikipedia, News-Artikel
- Antworte NUR mit der URL, nichts anderes
- Wenn kein passender Link gefunden wird, antworte mit "NONE"`,
        },
        {
          role: "user",
          content: `Finde den Ticket-Link für "Pater Brown" im "${venue}" in "${city}".\n\nSuchergebnisse:\n${resultsText}`,
        },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content?.trim() || "";

  if (answer === "NONE" || !answer.startsWith("http")) return null;
  return answer;
}

/**
 * Direkt die Venue-Website crawlen und nach Pater Brown Ticket-Links suchen.
 * Sucht auf der Hauptseite und typischen Unterseiten (Programm, Spielplan, Veranstaltungen).
 */
async function crawlVenueWebsite(venueUrl: string): Promise<string | null> {
  const baseUrl = new URL(venueUrl);
  const origin = baseUrl.origin;

  // Seiten die wir crawlen: Startseite + typische Programmseiten
  const pagesToCrawl = [
    venueUrl,
    `${origin}/programm`,
    `${origin}/spielplan`,
    `${origin}/veranstaltungen`,
    `${origin}/tickets`,
    `${origin}/vorverkauf`,
    `${origin}/events`,
    `${origin}/kalender`,
  ];

  const paterBrownKeywords = ["pater brown", "pater-brown", "paterbrown", "live-hörspiel", "live-hoerspiel"];
  const ticketKeywords = ["ticket", "karten", "vorverkauf", "reserv", "bestell", "kauf", "buchen"];

  for (const pageUrl of pagesToCrawl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(pageUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PaterBrownBot/1.0)",
          "Accept": "text/html",
        },
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!response.ok) continue;

      const html = await response.text();
      const htmlLower = html.toLowerCase();

      // Prüfe ob Pater Brown überhaupt auf der Seite erwähnt wird
      const hasPaterBrown = paterBrownKeywords.some((kw) => htmlLower.includes(kw));
      if (!hasPaterBrown) continue;

      console.log(`[Research] Pater Brown found on: ${pageUrl}`);

      // Links extrahieren und nach Ticket-Links filtern
      const linkRegex = /href=["']([^"']+)["']/gi;
      let match;
      const candidateLinks: string[] = [];

      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) continue;

        // Absolute URL bauen
        let absoluteUrl: string;
        try {
          absoluteUrl = new URL(href, pageUrl).toString();
        } catch {
          continue;
        }

        const hrefLower = absoluteUrl.toLowerCase();

        // Link muss entweder Pater Brown ODER Ticket-Keywords enthalten
        const hasTicketKw = ticketKeywords.some((kw) => hrefLower.includes(kw));
        const hasPBInLink = paterBrownKeywords.some((kw) => hrefLower.includes(kw));

        if (hasTicketKw || hasPBInLink) {
          candidateLinks.push(absoluteUrl);
        }
      }

      if (candidateLinks.length === 0) continue;

      // Bevorzuge Links die BEIDES haben (Pater Brown + Ticket)
      const bestLinks = candidateLinks.filter((url) => {
        const urlLower = url.toLowerCase();
        return paterBrownKeywords.some((kw) => urlLower.includes(kw)) &&
               ticketKeywords.some((kw) => urlLower.includes(kw));
      });

      if (bestLinks.length > 0) return bestLinks[0];

      // Sonst Links die Pater Brown im Pfad haben
      const pbLinks = candidateLinks.filter((url) =>
        paterBrownKeywords.some((kw) => url.toLowerCase().includes(kw))
      );
      if (pbLinks.length > 0) return pbLinks[0];

      // Fallback: erster Ticket-Link auf einer Seite die Pater Brown erwähnt
      return candidateLinks[0];
    } catch (e) {
      // Seite nicht erreichbar - weiter zur nächsten
      continue;
    }
  }

  return null;
}
