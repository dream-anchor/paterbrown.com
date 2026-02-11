import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAIN = "paterbrown.com";
const INDEXNOW_KEY = "632246dddb1648e4a6b121fe9ed72df5";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json() as { urls?: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "urls array is required and must not be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure all URLs are absolute
    const urlList = urls.map(url =>
      url.startsWith("http") ? url : `https://${DOMAIN}${url.startsWith("/") ? "" : "/"}${url}`
    );

    const payload = {
      host: DOMAIN,
      key: INDEXNOW_KEY,
      keyLocation: `https://${DOMAIN}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    console.log(`[IndexNow] Submitting ${urlList.length} URLs:`, urlList);

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const statusCode = response.status;
    const responseText = await response.text();

    // Log response codes per spec
    const statusMessages: Record<number, string> = {
      200: "OK - URLs submitted successfully",
      202: "Accepted - URLs accepted, key validation pending",
      400: "Bad Request - Invalid format",
      403: "Forbidden - Key not valid",
      422: "Unprocessable Entity - URLs don't belong to host or key not found",
      429: "Too Many Requests - Rate limited",
    };

    const statusMessage = statusMessages[statusCode] || `Unknown status: ${statusCode}`;
    console.log(`[IndexNow] Response: ${statusCode} - ${statusMessage}`);
    if (responseText) console.log(`[IndexNow] Body: ${responseText}`);

    return new Response(
      JSON.stringify({
        success: statusCode >= 200 && statusCode < 300,
        status: statusCode,
        message: statusMessage,
        urlCount: urlList.length,
        urls: urlList,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[IndexNow] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
