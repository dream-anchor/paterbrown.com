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
  ticket_type: "online" | "telefon" | "vor_ort" | "abendkasse" | "email" | "gemischt" | "pending" | "unbekannt";
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

    // ── Log available API keys ──
    console.log(`[Research] ═══ Start: "${searchVenue}" in "${searchCity}" ═══`);
    console.log(`[Research] venue_url: ${searchVenueUrl || "EMPTY"}`);
    console.log(`[Research] API keys: Firecrawl=${firecrawlApiKey ? "YES" : "NO"} | Google=${googleSearchApiKey ? "YES" : "NO"} | AI=${lovableApiKey ? "YES" : "NO"}`);

    let result: ResearchResult | null = null;

    // ══════════════════════════════════════════════════════════════
    // PRE-STEP: Website Discovery — find venue URL if missing
    // ══════════════════════════════════════════════════════════════
    if (!searchVenueUrl && firecrawlApiKey && lovableApiKey) {
      console.log(`[Research] Pre-Step — Website Discovery: venue_url is empty, searching...`);
      const discoveredUrl = await discoverVenueWebsite(searchVenue || "", searchCity || "", firecrawlApiKey, lovableApiKey, googleSearchApiKey, googleSearchEngineId);
      if (discoveredUrl) {
        searchVenueUrl = discoveredUrl;
        console.log(`[Research] ✓ Discovered venue URL: ${discoveredUrl}`);
        // Save discovered URL to DB for future runs
        const { error: urlSaveError } = await supabase
          .from("admin_events")
          .update({ venue_url: discoveredUrl })
          .eq("id", event_id);
        if (urlSaveError) {
          console.log(`[Research] Could not save venue_url: ${urlSaveError.message}`);
        } else {
          console.log(`[Research] Saved venue_url to DB`);
        }
      } else {
        console.log(`[Research] ✗ Pre-Step — Could not find venue website`);
      }
    } else if (!searchVenueUrl) {
      console.log(`[Research] Pre-Step — SKIPPED: venue_url empty AND missing API keys (Firecrawl=${firecrawlApiKey ? "YES" : "NO"}, AI=${lovableApiKey ? "YES" : "NO"})`);
    }

    // ── Strategy 0: Firecrawl + AI (Game-Changer) ──
    if (!result && searchVenueUrl && firecrawlApiKey && lovableApiKey) {
      console.log(`[Research] Strategy 0 — Firecrawl + AI: ${searchVenueUrl}`);
      try {
        result = await firecrawlStrategy(searchVenueUrl, searchVenue || "", searchCity || "", firecrawlApiKey, lovableApiKey);
        if (result) {
          console.log(`[Research] ✓ Strategy 0 found: ${result.ticket_url} (${result.confidence}, type=${result.ticket_type})`);
        } else {
          console.log(`[Research] ✗ Strategy 0 — no result`);
        }
      } catch (e) {
        console.log(`[Research] ✗ Strategy 0 EXCEPTION: ${e}`);
      }
    } else if (!result) {
      const reasons: string[] = [];
      if (!searchVenueUrl) reasons.push("no venue_url");
      if (!firecrawlApiKey) reasons.push("no FIRECRAWL_API_KEY");
      if (!lovableApiKey) reasons.push("no LOVABLE_API_KEY");
      console.log(`[Research] Strategy 0 — SKIPPED: ${reasons.join(", ")}`);
    }

    // ── Strategy 1: Google site-specific search ──
    if (!result && searchVenueUrl && googleSearchApiKey && googleSearchEngineId) {
      try {
        const domain = new URL(searchVenueUrl).hostname;
        const query = `site:${domain} Pater Brown`;
        console.log(`[Research] Strategy 1 — Site search: ${query}`);

        const url = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
        if (url) {
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
        } else {
          console.log(`[Research] ✗ Strategy 1 — no Google results`);
        }
      } catch (e) {
        console.log(`[Research] ✗ Strategy 1 EXCEPTION: ${e}`);
      }
    } else if (!result) {
      const reasons: string[] = [];
      if (!searchVenueUrl) reasons.push("no venue_url");
      if (!googleSearchApiKey) reasons.push("no GOOGLE_SEARCH_API_KEY");
      if (!googleSearchEngineId) reasons.push("no GOOGLE_SEARCH_ENGINE_ID");
      console.log(`[Research] Strategy 1 — SKIPPED: ${reasons.join(", ")}`);
    }

    // ── Strategy 2: General Google search ──
    if (!result && googleSearchApiKey && googleSearchEngineId) {
      const query = `Pater Brown Live-Hörspiel ${searchVenue} ${searchCity}`;
      console.log(`[Research] Strategy 2 — General search: ${query}`);

      const url = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
      if (url) {
        // Also try to scrape this result with Firecrawl for details
        if (firecrawlApiKey && lovableApiKey) {
          const detailed = await firecrawlAnalyzeSinglePage(url, searchVenue || "", searchCity || "", firecrawlApiKey, lovableApiKey);
          if (detailed) {
            result = detailed;
            result.source_description = "Gefunden via Google-Suche + AI-Analyse";
          }
        }
        if (!result) {
          result = { ticket_url: url, ticket_info: null, ticket_type: "unbekannt", confidence: "medium", source_description: "Gefunden via Google-Suche" };
        }
        console.log(`[Research] ✓ Strategy 2 found: ${result.ticket_url}`);
      } else {
        console.log(`[Research] ✗ Strategy 2 — no Google results`);
      }
    } else if (!result) {
      console.log(`[Research] Strategy 2 — SKIPPED: no GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID`);
    }

    // ── Strategy 3: Venue program search ──
    if (!result && googleSearchApiKey && googleSearchEngineId) {
      const query = `${searchVenue} ${searchCity} Spielplan 2026`;
      console.log(`[Research] Strategy 3 — Program search: ${query}`);

      const url = await googleSearch(query, googleSearchApiKey, googleSearchEngineId);
      if (url) {
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
      } else {
        console.log(`[Research] ✗ Strategy 3 — no Google results`);
      }
    } else if (!result) {
      console.log(`[Research] Strategy 3 — SKIPPED: no Google API keys`);
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
        } else {
          console.log(`[Research] ✗ Strategy 4 — AI found nothing`);
        }
      } else {
        console.log(`[Research] ✗ Strategy 4 — no Google results to analyze`);
      }
    } else if (!result) {
      const reasons: string[] = [];
      if (!lovableApiKey) reasons.push("no LOVABLE_API_KEY");
      if (!googleSearchApiKey) reasons.push("no GOOGLE_SEARCH_API_KEY");
      console.log(`[Research] Strategy 4 — SKIPPED: ${reasons.join(", ")}`);
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

    console.log(`[Research] ═══ Done: ${result ? `${result.confidence} — ${result.ticket_type}` : "NOT FOUND"} ═══`);

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
// WEBSITE DISCOVERY: Find venue URL when venue_url is empty
// Uses Google Search or Firecrawl to find the official website
// ═══════════════════════════════════════════════════════════════
async function discoverVenueWebsite(
  venueName: string,
  city: string,
  firecrawlApiKey: string,
  aiApiKey: string,
  googleApiKey?: string | null,
  googleEngineId?: string | null
): Promise<string | null> {
  // Blocked domains — these are NOT venue websites
  const blockedDomains = [
    "facebook.com", "instagram.com", "twitter.com", "youtube.com",
    "wikipedia.org", "landgraf.de", "eventim.de", "reservix.de",
    "ticketmaster.de", "paterbrown.com",
  ];

  // Strategy A: Google Search for venue website
  if (googleApiKey && googleEngineId) {
    const query = `"${venueName}" ${city} offizielle Website`;
    console.log(`[Discovery] Google search: ${query}`);
    try {
      const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
      searchUrl.searchParams.set("key", googleApiKey);
      searchUrl.searchParams.set("cx", googleEngineId);
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("num", "5");

      const response = await fetch(searchUrl.toString());
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        console.log(`[Discovery] Google returned ${items.length} results`);

        for (const item of items) {
          const link = item.link || "";
          if (blockedDomains.some((d) => link.includes(d))) continue;
          // Check if the result looks like a venue homepage (not a subpage deep in some portal)
          try {
            const parsed = new URL(link);
            const pathParts = parsed.pathname.split("/").filter(Boolean);
            if (pathParts.length <= 2) {
              console.log(`[Discovery] Found via Google: ${link}`);
              return parsed.origin + (pathParts.length > 0 ? "/" + pathParts[0] : "");
            }
          } catch { /* skip invalid URLs */ }
        }
        // Fallback: first non-blocked result
        for (const item of items) {
          if (!blockedDomains.some((d) => item.link?.includes(d))) {
            console.log(`[Discovery] Fallback Google result: ${item.link}`);
            return item.link;
          }
        }
      }
    } catch (e) {
      console.log(`[Discovery] Google search error: ${e}`);
    }
  }

  // Strategy B: AI-assisted discovery via Firecrawl Google search page
  // Scrape a Google search result page via Firecrawl (renders JS)
  console.log(`[Discovery] Trying Firecrawl-based search...`);
  try {
    const searchQuery = encodeURIComponent(`${venueName} ${city} Theater Spielplan`);
    const googleUrl = `https://www.google.com/search?q=${searchQuery}`;
    const searchPage = await firecrawlScrape(googleUrl, firecrawlApiKey, true);
    if (searchPage && searchPage.links.length > 0) {
      console.log(`[Discovery] Firecrawl Google: found ${searchPage.links.length} links`);
      for (const link of searchPage.links) {
        if (blockedDomains.some((d) => link.includes(d))) continue;
        if (link.includes("google.com")) continue;
        try {
          const parsed = new URL(link);
          console.log(`[Discovery] Found via Firecrawl Google: ${parsed.origin}`);
          return parsed.origin;
        } catch { /* skip */ }
      }
    }
  } catch (e) {
    console.log(`[Discovery] Firecrawl search error: ${e}`);
  }

  return null;
}

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
        onlyMainContent: !includeLinks, // false for homepage (need nav links), true for subpages
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

// Keywords that identify generic VVK/ticket info pages (even without PB mention)
const VVK_PAGE_KEYWORDS = [
  "vorverkauf", "vvk", "ticket", "karten", "kartenverkauf", "eintritt",
  "reservierung", "reservieren", "bestell", "abendkasse", "theaterkasse",
  "ticketregional", "reservix", "eventim", "adticket", "proticket",
];

async function firecrawlStrategy(
  venueUrl: string,
  venueName: string,
  city: string,
  firecrawlApiKey: string,
  aiApiKey: string
): Promise<ResearchResult | null> {
  let firecrawlCalls = 0;
  const maxFirecrawlCalls = 4;

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

  // ── Step 3: Scrape subpages — look for PB AND generic VVK pages ──
  let genericVvkPages: Array<{ url: string; markdown: string }> = [];

  for (const candidate of candidateLinks) {
    if (firecrawlCalls >= maxFirecrawlCalls) {
      console.log(`[Strategy0] Firecrawl limit reached (${maxFirecrawlCalls})`);
      break;
    }

    const subpage = await firecrawlScrape(candidate.url, firecrawlApiKey, false);
    firecrawlCalls++;
    if (!subpage) continue;

    const subLower = subpage.markdown.toLowerCase();

    // Check if PB is explicitly mentioned on this subpage
    if (PATER_BROWN_KEYWORDS.some((kw) => subLower.includes(kw))) {
      console.log(`[Strategy0] Pater Brown found on: ${candidate.url}`);
      const aiResult = await aiExtractTicketInfo(subpage.markdown, candidate.url, venueName, city, aiApiKey);
      if (aiResult) return aiResult;
    }

    // Collect generic VVK/ticket pages for fallback analysis
    const isTicketPage = VVK_PAGE_KEYWORDS.some((kw) => subLower.includes(kw) || candidate.url.toLowerCase().includes(kw));
    if (isTicketPage) {
      console.log(`[Strategy0] Generic VVK page found: ${candidate.url}`);
      genericVvkPages.push({ url: candidate.url, markdown: subpage.markdown });
    }
  }

  // ── Step 4: Analyze generic VVK pages (no PB keyword required) ──
  // The venue is CONFIRMED to host PB (it's in our DB), so generic ticket info is useful
  if (genericVvkPages.length > 0) {
    console.log(`[Strategy0] Analyzing ${genericVvkPages.length} generic VVK page(s)...`);
    for (const page of genericVvkPages) {
      const aiResult = await aiExtractGenericVVKInfo(page.markdown, page.url, venueName, city, aiApiKey);
      if (aiResult) return aiResult;
    }
  }

  // ── Step 5: Fallback — analyze homepage for generic VVK info ──
  // Even the homepage may have "Karten: 0123/456789" in footer etc.
  if (pbOnHomepage) {
    const fallback = await aiExtractTicketInfo(homepage.markdown, venueUrl, venueName, city, aiApiKey);
    if (fallback) return fallback;
  }

  // Last resort: check homepage for generic VVK info (footer, sidebar, etc.)
  const homepageVvk = await aiExtractGenericVVKInfo(homepage.markdown, venueUrl, venueName, city, aiApiKey);
  if (homepageVvk) return homepageVvk;

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

  // If PB is mentioned, use the PB-specific AI
  if (PATER_BROWN_KEYWORDS.some((kw) => lower.includes(kw))) {
    return await aiExtractTicketInfo(page.markdown, pageUrl, venueName, city, aiApiKey);
  }

  // Fallback: analyze as generic VVK page (PB is confirmed in our DB)
  return await aiExtractGenericVVKInfo(page.markdown, pageUrl, venueName, city, aiApiKey);
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
// AI: Extract GENERIC ticket/VVK info (NO Pater Brown mention required)
// Used when venue is confirmed (in our DB) but PB not on their website yet.
// Asks: "How does this venue generally sell tickets?"
// ═══════════════════════════════════════════════════════════════
async function aiExtractGenericVVKInfo(
  markdown: string,
  pageUrl: string,
  venueName: string,
  city: string,
  apiKey: string
): Promise<ResearchResult | null> {
  // Take relevant sections — focus on ticket-related content (max 4000 chars)
  const lower = markdown.toLowerCase();
  const sections: string[] = [];

  // Find sections around VVK keywords
  for (const kw of VVK_PAGE_KEYWORDS) {
    if (sections.length >= 3) break;
    let searchFrom = 0;
    while (searchFrom < lower.length && sections.length < 3) {
      const idx = lower.indexOf(kw, searchFrom);
      if (idx === -1) break;
      const start = Math.max(0, idx - 500);
      const end = Math.min(markdown.length, idx + 1000);
      const section = markdown.substring(start, end);
      // Avoid duplicate sections
      if (!sections.some((s) => s.includes(section.substring(idx - start, idx - start + 50)))) {
        sections.push(section);
      }
      searchFrom = idx + 200;
    }
  }

  // Fallback: first 3000 chars if no keyword sections found
  if (sections.length === 0) {
    sections.push(markdown.substring(0, 3000));
  }

  const prompt = `Finde die ALLGEMEINEN Kontaktdaten für den Kartenvorverkauf des Venues "${venueName}" in "${city}".

WICHTIG: "Pater Brown" ist NICHT auf dieser Seite. Wir suchen die GENERELLEN Kontaktdaten der Theaterkasse / des Kartenvorverkaufs.

Seiten-URL: ${pageUrl}

Seiteninhalt:
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

SITUATION: "Pater Brown - Das Live-Hörspiel" gastiert an diesem Venue, ist aber NOCH NICHT auf deren Website gelistet. Wir brauchen die ALLGEMEINEN Kontaktdaten der Theaterkasse / des Kartenvorverkaufs.

Suche nach diesen Informationen:
- Telefonnummer der Theaterkasse / des Kartenservice (oft unter "Kasse", "Theaterkasse", "Vorverkauf", "Tickets", "Kartenservice")
- E-Mail-Adresse für Reservierungen / Kartenbestellungen
- Link zur allgemeinen Tickets/Vorverkauf/Spielplan-Seite
- Adresse und Öffnungszeiten der Vorverkaufsstelle / Theaterkasse
- Externe VVK-Partner (z.B. "Tickets bei der Tourist-Info", "VVK im Bürgerbüro")
- Online-Ticketportale die das Venue nutzt (Reservix, Ticketregional, ADticket, ProTicket)

LIES GENAU: Die Info steht oft im Footer, in Seitenleisten, unter "Service", "Kontakt", "Tickets", "Vorverkauf", "Karten", "Anfahrt & Tickets".

Antworte im JSON-Format:
{"ticket_url": "https://...", "ticket_info": "..."}

Felder:
- "ticket_url": Link zur allgemeinen Ticket/Spielplan/VVK-Seite. Wenn kein spezifischer Link: die Seiten-URL. NIEMALS einen Link zu einer ANDEREN Veranstaltung!
- "ticket_info": Fasse die Kontaktinfos als kurzen, lesbaren Text zusammen. Z.B. "Theaterkasse: Tel. 05731/130051, Mo-Fr 10-16 Uhr. E-Mail: kasse@theater.de" oder "VVK über Ticket Regional: Tel. 0651/9790777. Lokaler VVK: Papiertruhe, Ringstraße 23"

WICHTIG:
- Antworte NUR mit dem JSON-Objekt
- Wenn KEINERLEI Kontaktdaten gefunden: {"ticket_url": null, "ticket_info": null}
- KEINE Links zu spezifischen anderen Events zurückgeben!`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    console.log(`[AI-Generic] HTTP ${response.status}`);
    return null;
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content?.trim() || "";
  console.log(`[AI-Generic] Response: ${answer}`);

  try {
    const jsonStr = answer.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    const ticketUrl = parsed.ticket_url && parsed.ticket_url !== "null" ? parsed.ticket_url : pageUrl;
    const ticketInfo = parsed.ticket_info && parsed.ticket_info !== "null" ? parsed.ticket_info : null;

    if (!ticketInfo && (!parsed.ticket_url || parsed.ticket_url === "null")) {
      return null;
    }

    // Generic VVK info = always "pending" type (PB not on their site yet)
    return {
      ticket_url: ticketUrl,
      ticket_info: ticketInfo,
      ticket_type: "pending" as const,
      confidence: "medium",
      source_description: `Allgemeine VVK-Kontaktdaten von ${new URL(pageUrl).hostname}`,
    };
  } catch {
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
