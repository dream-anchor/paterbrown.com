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

interface ResearchResult {
  ticket_url: string | null;
  ticket_info: string | null;
  ticket_type: "online" | "telefon" | "vor_ort" | "abendkasse" | "email" | "gemischt" | "unbekannt";
  confidence: "high" | "medium" | "low";
  source_description: string;
}

// ═══════════════════════════════════════════════════════════════
// Main handler
// ═══════════════════════════════════════════════════════════════
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
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch event data from DB if not provided
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

    console.log(`[Research] ═══ Start: ${searchVenue} in ${searchCity} ═══`);

    let result: ResearchResult | null = null;

    // ── Strategy 0: Firecrawl + AI (Game-Changer) ──
    // Firecrawl renders JS, returns Markdown. AI reads the content.
    if (!result && searchVenueUrl && firecrawlApiKey && lovableApiKey) {
      console.log(`[Research] Strategy 0 — Firecrawl + AI: ${searchVenueUrl}`);
      try {
        result = await firecrawlStrategy(searchVenueUrl, searchVenue || "", searchCity || "", firecrawlApiKey, lovableApiKey);
        if (result) console.log(`[Research] ✓ Strategy 0 found: ${result.ticket_url} (${result.confidence})`);
      } catch (e) {
        console.log(`[Research] ✗ Strategy 0 failed: ${e}`);
      }
    }

    // ── Strategy 1: Google site-specific search (loosened) ──
    if (!result && searchVenueUrl && googleSearchApiKey && googleSearchEngineId) {
      try {
        const domain = new URL(searchVenueUrl).hostname;
        const query = `site:${domain} Pater Brown`;
        console.log(`[Research] Strategy 1 — Site search: ${query}`);

        const url = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
        if (url) {
          // Found a page on the venue site mentioning PB — scrape it with Firecrawl for details
          if (firecrawlApiKey && lovableApiKey) {
            const detailed = await firecrawlAnalyzeSinglePage(url, searchVenue || "", searchCity || "", firecrawlApiKey, lovableApiKey);
            if (detailed) {
              result = detailed;
              result.source_description = `Gefunden auf ${domain} via Google`;
            }
          }
          if (!result) {
            result = { ticket_url: url, ticket_info: null, ticket_type: "unbekannt", confidence: "medium", source_description: `Gefunden auf ${domain}` };
          }
          console.log(`[Research] ✓ Strategy 1 found: ${result.ticket_url}`);
        }
      } catch (e) {
        console.log(`[Research] ✗ Strategy 1 failed: ${e}`);
      }
    }

    // ── Strategy 2: General Google search (loosened — no double quotes) ──
    if (!result && googleSearchApiKey && googleSearchEngineId) {
      const query = `Pater Brown Live-Hörspiel ${searchVenue} ${searchCity}`;
      console.log(`[Research] Strategy 2 — General search: ${query}`);

      const url = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
      if (url) {
        result = { ticket_url: url, ticket_info: null, ticket_type: "unbekannt", confidence: "medium", source_description: "Gefunden via Google-Suche" };
        console.log(`[Research] ✓ Strategy 2 found: ${url}`);
      }
    }

    // ── Strategy 3: Venue program search (loosened, with year) ──
    if (!result && googleSearchApiKey && googleSearchEngineId) {
      const query = `${searchVenue} ${searchCity} Spielplan 2026`;
      console.log(`[Research] Strategy 3 — Program search: ${query}`);

      const url = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
      if (url) {
        // Scrape the program page with Firecrawl to check if PB is mentioned
        if (firecrawlApiKey && lovableApiKey) {
          const detailed = await firecrawlAnalyzeSinglePage(url, searchVenue || "", searchCity || "", firecrawlApiKey, lovableApiKey);
          if (detailed) {
            result = detailed;
            result.source_description = "Spielplan-Seite des Venues";
          }
        }
        if (!result) {
          result = { ticket_url: url, ticket_info: null, ticket_type: "unbekannt", confidence: "low", source_description: "Spielplan/VVK-Seite des Venues" };
        }
        console.log(`[Research] ✓ Strategy 3 found: ${result.ticket_url}`);
      }
    }

    // ── Strategy 4: AI analysis of Google search results ──
    if (!result && lovableApiKey && googleSearchApiKey && googleSearchEngineId) {
      console.log("[Research] Strategy 4 — AI analysis of search results");

      const query = `Pater Brown Live-Hörspiel ${searchCity} Tickets`;
      const searchResults = await googleSearchFull(query, googleSearchApiKey, googleSearchEngineId);

      if (searchResults.length > 0) {
        const aiResult = await aiAnalyzeSearchResults(searchResults, searchVenue!, searchCity!, lovableApiKey);
        if (aiResult) {
          result = { ticket_url: aiResult, ticket_info: null, ticket_type: "unbekannt", confidence: "medium", source_description: "AI-Analyse der Suchergebnisse" };
          console.log(`[Research] ✓ Strategy 4 found: ${aiResult}`);
        }
      }
    }

    // ── Save results to DB ──
    if (result && result.ticket_url) {
      const updateData: Record<string, unknown> = { ticket_url: result.ticket_url };
      if (result.ticket_info) updateData.ticket_info = result.ticket_info;
      if (result.ticket_type && result.ticket_type !== "unbekannt") updateData.ticket_type = result.ticket_type;

      const { error: updateError } = await supabase
        .from("admin_events")
        .update(updateData)
        .eq("id", event_id);

      if (updateError) {
        console.error("[Research] DB save error:", updateError);
      } else {
        console.log(`[Research] Saved to DB for event ${event_id}`);
      }
    }

    console.log(`[Research] ═══ Done: ${result ? result.confidence : "not found"} ═══`);

    return new Response(
      JSON.stringify({
        success: true,
        ticket_url: result?.ticket_url || null,
        ticket_info: result?.ticket_info || null,
        ticket_type: result?.ticket_type || "unbekannt",
        confidence: result?.confidence || "low",
        source_description: result?.source_description || "Kein Ticket-Link gefunden",
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

// ═══════════════════════════════════════════════════════════════
// FIRECRAWL: Scrape a URL, get rendered Markdown back
// ═══════════════════════════════════════════════════════════════
async function firecrawlScrape(
  url: string,
  apiKey: string,
  includeLinks = true
): Promise<{ markdown: string; links: string[] } | null> {
  try {
    console.log(`[Firecrawl] Scraping: ${url}`);
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: includeLinks ? ["markdown", "links"] : ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.log(`[Firecrawl] HTTP ${response.status} for ${url}`);
      return null;
    }

    const data = await response.json();
    if (!data.success) {
      console.log(`[Firecrawl] API error: ${data.error}`);
      return null;
    }

    const markdown = data.data?.markdown || "";
    const links = data.data?.links || [];
    console.log(`[Firecrawl] Got ${markdown.length} chars markdown, ${links.length} links`);
    return { markdown, links };
  } catch (e) {
    console.log(`[Firecrawl] Exception: ${e}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// STRATEGY 0: Firecrawl + AI — The main strategy
// 1. Scrape venue homepage with Firecrawl
// 2. If PB found → send to AI for ticket info extraction
// 3. If not → find promising subpages from links, scrape those (max 3 total)
// 4. AI analyzes all collected content
// ═══════════════════════════════════════════════════════════════
const PATER_BROWN_KEYWORDS = ["pater brown", "pater-brown", "paterbrown", "live-hörspiel", "live-hoerspiel", "live hörspiel"];

const SUBPAGE_KEYWORDS = [
  "programm", "spielplan", "veranstaltung", "event", "ticket", "karten",
  "vorverkauf", "kalender", "aktuell", "vorschau", "termine", "spielzeit",
  "saison", "kulturprogramm", "theaterprogram", "buehne", "bühne",
];

async function firecrawlStrategy(
  venueUrl: string,
  venueName: string,
  city: string,
  firecrawlApiKey: string,
  aiApiKey: string
): Promise<ResearchResult | null> {
  let firecrawlCalls = 0;
  const maxFirecrawlCalls = 3;

  // ── Step 1: Scrape homepage ──
  const homepage = await firecrawlScrape(venueUrl, firecrawlApiKey, true);
  firecrawlCalls++;
  if (!homepage) return null;

  const homepageLower = homepage.markdown.toLowerCase();
  const pbOnHomepage = PATER_BROWN_KEYWORDS.some((kw) => homepageLower.includes(kw));

  if (pbOnHomepage) {
    console.log(`[Strategy0] Pater Brown found on homepage!`);
    const aiResult = await aiExtractTicketInfo(homepage.markdown, venueUrl, venueName, city, aiApiKey);
    if (aiResult && aiResult.confidence !== "low") return aiResult;
    // Low confidence on homepage → keep searching subpages
  }

  // ── Step 2: Find promising subpages from links ──
  const origin = new URL(venueUrl).origin;
  const candidateLinks = homepage.links
    .filter((link: string) => {
      try {
        const parsed = new URL(link);
        return parsed.origin === origin; // internal links only
      } catch {
        return false;
      }
    })
    .filter((link: string) => {
      const lower = link.toLowerCase();
      // Skip assets
      if (/\.(jpg|jpeg|png|gif|svg|css|js|pdf|doc|zip|ico|woff|woff2|ttf|eot)(\?|$)/i.test(lower)) return false;
      // Skip homepage itself
      if (link.replace(/\/+$/, "") === venueUrl.replace(/\/+$/, "")) return false;
      return true;
    })
    .map((link: string) => {
      const lower = link.toLowerCase();
      let score = 0;
      // Direct PB mention in URL = top priority
      if (PATER_BROWN_KEYWORDS.some((kw) => lower.includes(kw.replace(/\s+/g, "-")))) score += 100;
      if (PATER_BROWN_KEYWORDS.some((kw) => lower.includes(kw.replace(/\s+/g, "")))) score += 100;
      // Subpage keywords
      for (const kw of SUBPAGE_KEYWORDS) {
        if (lower.includes(kw)) score += 3;
      }
      return { url: link, score };
    })
    .filter((l: { score: number }) => l.score > 0)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 8); // Keep top 8 candidates but will only scrape up to maxFirecrawlCalls

  if (candidateLinks.length > 0) {
    console.log(`[Strategy0] Top subpage candidates: ${candidateLinks.slice(0, 5).map((l: { url: string; score: number }) => `${l.url} (${l.score})`).join(" | ")}`);
  }

  // ── Step 3: Scrape subpages ──
  for (const candidate of candidateLinks) {
    if (firecrawlCalls >= maxFirecrawlCalls) {
      console.log(`[Strategy0] Firecrawl limit reached (${maxFirecrawlCalls})`);
      break;
    }

    const subpage = await firecrawlScrape(candidate.url, firecrawlApiKey, false);
    firecrawlCalls++;
    if (!subpage) continue;

    const subLower = subpage.markdown.toLowerCase();
    if (!PATER_BROWN_KEYWORDS.some((kw) => subLower.includes(kw))) {
      console.log(`[Strategy0] No PB on: ${candidate.url}`);
      continue;
    }

    console.log(`[Strategy0] Pater Brown found on: ${candidate.url}`);
    const aiResult = await aiExtractTicketInfo(subpage.markdown, candidate.url, venueName, city, aiApiKey);
    if (aiResult) return aiResult;
  }

  // If PB was found on homepage but AI returned low confidence, return that as fallback
  if (pbOnHomepage) {
    const fallback = await aiExtractTicketInfo(homepage.markdown, venueUrl, venueName, city, aiApiKey);
    if (fallback) return fallback;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// Firecrawl: Scrape a single page and analyze with AI
// Used by Strategy 1+3 when Google finds a URL
// ═══════════════════════════════════════════════════════════════
async function firecrawlAnalyzeSinglePage(
  pageUrl: string,
  venueName: string,
  city: string,
  firecrawlApiKey: string,
  aiApiKey: string
): Promise<ResearchResult | null> {
  const page = await firecrawlScrape(pageUrl, firecrawlApiKey, false);
  if (!page) return null;

  const lower = page.markdown.toLowerCase();
  if (!PATER_BROWN_KEYWORDS.some((kw) => lower.includes(kw))) return null;

  return await aiExtractTicketInfo(page.markdown, pageUrl, venueName, city, aiApiKey);
}

// ═══════════════════════════════════════════════════════════════
// AI: Extract ticket info from Markdown page content
// This is the core AI function — reads text and finds ticket info
// ═══════════════════════════════════════════════════════════════
async function aiExtractTicketInfo(
  markdown: string,
  pageUrl: string,
  venueName: string,
  city: string,
  apiKey: string
): Promise<ResearchResult | null> {
  // Extract sections around PB mentions (max 4000 chars to stay within token limits)
  const lower = markdown.toLowerCase();
  const sections: string[] = [];
  let searchFrom = 0;

  while (searchFrom < lower.length && sections.length < 3) {
    const idx = lower.indexOf("pater brown", searchFrom);
    if (idx === -1) break;
    const start = Math.max(0, idx - 1000);
    const end = Math.min(markdown.length, idx + 1500);
    sections.push(markdown.substring(start, end));
    searchFrom = idx + 200;
  }

  // Fallback: if PB keywords found but not "pater brown" literally, take first 3000 chars
  if (sections.length === 0) {
    sections.push(markdown.substring(0, 3000));
  }

  const prompt = `Finde Ticket-/VVK-Informationen für "Pater Brown - Das Live-Hörspiel" im "${venueName}" in "${city}".

Seiten-URL: ${pageUrl}

Seiteninhalt (Markdown):
---
${sections.join("\n---\n")}
---`;

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
          content: `Du bist Recherche-Assistent für eine Theatertournee.

Deine Aufgabe: Finde auf dieser Webseite heraus, wie Besucher an Tickets für "Pater Brown - Das Live-Hörspiel" kommen.

WICHTIG: Jeder Spielort handhabt den Kartenverkauf anders! Das kann ALLES sein:
- Online-Ticketshop (Eventim, Reservix, Ticketregional, ADticket, ProTicket, eigener Webshop)
- Telefonnummer für telefonischen VVK
- Lokaler Vorverkauf (Tabak-Laden, Bücherei, Tourist-Info, Rathaus, Buchhandlung)
- Theaterkasse oder Abendkasse
- Reservierungsformular oder E-Mail-Adresse
- PDF-Flyer mit VVK-Infos
- Externer Ticket-Anbieter
- Oder irgendetwas anderes

LIES GENAU: Der VVK-Hinweis steht oft versteckt im Fließtext, in der Beschreibung, in einer Seitenleiste oder im Footer. Manchmal steht da nur "Karten an der Abendkasse" oder "VVK bei Schreibwaren Müller" oder "Reservierung unter 06123/4567".

Antworte im JSON-Format:
{"ticket_url": "https://...", "ticket_info": "...", "ticket_type": "..."}

Felder:
- "ticket_url": Der BESTE Link. Wenn ein direkter Kauf-Link existiert, nimm den. Wenn nur die Event-Seite existiert, nimm deren URL. Wenn nur Tel/Adresse: nimm die Seiten-URL.
- "ticket_info": Gib WÖRTLICH wieder, was die Quelle über den Kartenverkauf sagt. Nicht interpretieren, sondern zitieren. Z.B. "Karten ab 25€ bei der Tourist-Info, Tel. 06124/1234" oder "Online über www.ticketregional.de"
- "ticket_type": Einer von: "online" | "telefon" | "vor_ort" | "abendkasse" | "email" | "gemischt" | "unbekannt"

Regeln:
- Antworte NUR mit dem JSON-Objekt
- Wenn keine Ticket-Info gefunden: {"ticket_url": null, "ticket_info": null, "ticket_type": "unbekannt"}`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    console.log(`[AI] HTTP ${response.status}`);
    return null;
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content?.trim() || "";
  console.log(`[AI] Response: ${answer}`);

  try {
    const jsonStr = answer.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    const ticketUrl = parsed.ticket_url && parsed.ticket_url !== "null" ? parsed.ticket_url : pageUrl;
    const ticketInfo = parsed.ticket_info && parsed.ticket_info !== "null" ? parsed.ticket_info : null;
    const ticketType = parsed.ticket_type || "unbekannt";

    // Determine confidence based on what we found
    let confidence: "high" | "medium" | "low" = "low";
    if (parsed.ticket_url && parsed.ticket_url !== "null" && parsed.ticket_url !== pageUrl) {
      confidence = "high"; // Direct ticket URL found
    } else if (ticketInfo) {
      confidence = "medium"; // VVK info found but maybe no direct link
    }

    if (!ticketInfo && (!parsed.ticket_url || parsed.ticket_url === "null")) {
      return null; // AI found nothing useful
    }

    return {
      ticket_url: ticketUrl,
      ticket_info: ticketInfo,
      ticket_type: ticketType,
      confidence,
      source_description: ticketInfo || "AI-Analyse der Venue-Website",
    };
  } catch {
    // JSON parse failed — try to extract URL
    const urlMatch = answer.match(/https?:\/\/[^\s"'<>)]+/);
    if (urlMatch) {
      return {
        ticket_url: urlMatch[0],
        ticket_info: null,
        ticket_type: "unbekannt",
        confidence: "medium",
        source_description: "AI-Analyse (URL extrahiert)",
      };
    }
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Google Custom Search — returns first relevant URL
// ═══════════════════════════════════════════════════════════════
async function googleSearch(query: string, apiKey: string, engineId: string): Promise<string | null> {
  try {
    const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("cx", engineId);
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("num", "5");

    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      console.log(`[Google] HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    const items = data.items || [];
    console.log(`[Google] ${items.length} results for: ${query}`);

    // Prefer ticket/event pages
    const ticketKeywords = ["/ticket", "/karten", "/vorverkauf", "/veranstaltung", "/event", "/programm", "/spielplan"];
    for (const item of items) {
      const url = item.link?.toLowerCase() || "";
      if (ticketKeywords.some((kw) => url.includes(kw))) {
        return item.link;
      }
    }

    // Fallback: first non-social-media result
    const blocked = ["facebook.com", "wikipedia.org", "instagram.com", "twitter.com", "youtube.com"];
    for (const item of items) {
      if (!blocked.some((b) => item.link?.includes(b))) {
        return item.link;
      }
    }

    return null;
  } catch (e) {
    console.log(`[Google] Error: ${e}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Google Custom Search — returns full results for AI analysis
// ═══════════════════════════════════════════════════════════════
async function googleSearchFull(
  query: string,
  apiKey: string,
  engineId: string
): Promise<Array<{ title: string; link: string; snippet: string }>> {
  try {
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
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// AI: Analyze Google search results — pick best URL
// Now also accepts non-direct-ticket pages (Spielplan etc.)
// ═══════════════════════════════════════════════════════════════
async function aiAnalyzeSearchResults(
  results: Array<{ title: string; link: string; snippet: string }>,
  venue: string,
  city: string,
  apiKey: string
): Promise<string | null> {
  const resultsText = results.map((r, i) => `${i + 1}. [${r.title}](${r.link})\n   ${r.snippet}`).join("\n\n");

  try {
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
            content: `Du findest Ticket-Links für Theaterveranstaltungen.
Analysiere die Suchergebnisse und finde die BESTE URL für "Pater Brown - Das Live-Hörspiel".

Prioritäten:
1. Direkte Ticket-/Karten-Kauf-Seite (Eventim, Reservix, etc.)
2. Event-Detailseite auf der Venue-Website
3. Spielplan/Programm-Seite des Venues (dort steht oft der VVK-Hinweis)
4. Jede andere relevante Seite

Ignoriere: Social Media, Wikipedia, News-Artikel, Podcast-Seiten
Antworte NUR mit der URL. Wenn nichts passt: "NONE"`,
          },
          {
            role: "user",
            content: `Ticket-Link für "Pater Brown" im "${venue}" in "${city}":\n\n${resultsText}`,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || "";
    console.log(`[AI-Search] Response: ${answer}`);

    if (answer === "NONE" || !answer.startsWith("http")) return null;
    return answer;
  } catch {
    return null;
  }
}
