import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventimProduct {
  productId: string;
  name: string;
  link: string;
  status: string;
  typeAttributes: {
    liveEntertainment: {
      startDate: string;
      location: {
        name: string;
        city: string;
        postalCode: string;
        geoLocation?: {
          longitude: number;
          latitude: number;
        };
      };
    };
  };
}

// Affiliate-Parameter für alle URLs
const AFFILIATE_PARAMS = {
  affiliate: 'KZB',
  utm_campaign: 'KBA',
  utm_source: 'KZB',
  utm_medium: 'dp',
};

function ensureAffiliateParams(url: string): string {
  const fallbackUrl = 'https://www.eventim.de/noapp/artist/antoine-monot/';
  if (!url || !url.startsWith('http')) {
    const baseUrl = new URL(fallbackUrl);
    for (const [key, value] of Object.entries(AFFILIATE_PARAMS)) {
      baseUrl.searchParams.set(key, value);
    }
    return baseUrl.toString();
  }
  try {
    const urlObj = new URL(url);
    for (const [key, value] of Object.entries(AFFILIATE_PARAMS)) {
      urlObj.searchParams.set(key, value);
    }
    return urlObj.toString();
  } catch {
    const baseUrl = new URL(fallbackUrl);
    for (const [key, value] of Object.entries(AFFILIATE_PARAMS)) {
      baseUrl.searchParams.set(key, value);
    }
    return baseUrl.toString();
  }
}

// Stadtname bereinigen
function cleanCityName(city: string): string {
  const cityMap: Record<string, string> = {
    'hamburg / harburg': 'Hamburg',
    'hamburg/harburg': 'Hamburg',
    'münchen / schwanthalerhöhe': 'München',
    'münchen/schwanthalerhöhe': 'München',
    'frankfurt / neu-isenburg': 'Neu-Isenburg',
    'frankfurt a.m.': 'Frankfurt',
    'frankfurt am main': 'Frankfurt',
    'giessen': 'Gießen',
  };
  const lowerCity = city.toLowerCase().trim();
  if (cityMap[lowerCity]) return cityMap[lowerCity];
  if (lowerCity.includes('neu-isenburg') || lowerCity.includes('isenburg')) return 'Neu-Isenburg';
  return city.split('/')[0].trim();
}

// Wochentag aus ISO-Datum
function getDayName(isoDate: string): string {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const d = new Date(isoDate);
  return days[d.getDay()];
}

/**
 * Alle Events von Eventim Public API holen (paginiert)
 */
async function fetchEventimEvents(): Promise<EventimProduct[]> {
  const allProducts: EventimProduct[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < 5; page++) {
    const apiUrl = `https://public-api.eventim.com/websearch/search/api/exploration/v1/products?search_term=pater+brown+antoine+monot&sort=DateAsc&page=${page}&top=20`;

    console.log(`Fetching Eventim API page ${page}...`);
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`Eventim API error page ${page}: ${response.status}`);
      break;
    }

    const data = await response.json();
    const products: EventimProduct[] = data.products || [];

    if (products.length === 0) break;

    let newCount = 0;
    for (const product of products) {
      if (!seen.has(product.productId)) {
        seen.add(product.productId);
        allProducts.push(product);
        newCount++;
      }
    }

    // Keine neuen Ergebnisse mehr = letzte Seite
    if (newCount === 0) break;
  }

  return allProducts;
}

async function sendErrorEmail(error: string, step: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Pater Brown Sync <onboarding@resend.dev>',
        to: ['monot@hey.com'],
        subject: `[FEHLER] Tour-Events Sync fehlgeschlagen: ${step}`,
        html: `
          <h2>Sync-Fehler aufgetreten</h2>
          <p><strong>Schritt:</strong> ${step}</p>
          <p><strong>Fehler:</strong></p>
          <pre>${error}</pre>
          <p><strong>Zeitpunkt:</strong> ${new Date().toISOString()}</p>
        `,
      }),
    });
  } catch (emailError) {
    console.error('Failed to send error email:', emailError);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Starting Tour Events Sync (Eventim API) ===');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // === Step 1: Eventim Public API abfragen ===
    console.log('Step 1: Fetching events from Eventim Public API...');
    const eventimProducts = await fetchEventimEvents();
    console.log(`Found ${eventimProducts.length} events from Eventim API`);

    if (eventimProducts.length === 0) {
      throw new Error('No events found from Eventim API');
    }

    // Events loggen
    eventimProducts.forEach((p, i) => {
      const loc = p.typeAttributes.liveEntertainment.location;
      const date = p.typeAttributes.liveEntertainment.startDate.substring(0, 10);
      console.log(`${i + 1}. ${date} - ${loc.city} - ${loc.name} → ${p.link.substring(0, 60)}...`);
    });

    // === Step 2: KBA Events deaktivieren ===
    console.log('Step 2: Deactivating existing KBA events...');
    const { error: deactivateError } = await supabase
      .from('tour_events')
      .update({ is_active: false })
      .eq('is_active', true)
      .or('source.is.null,source.eq.KBA');

    if (deactivateError) {
      console.error('Error deactivating KBA events:', deactivateError);
    }

    // === Step 3: Events in DB schreiben ===
    console.log('Step 3: Upserting events...');
    let insertedCount = 0;
    let updatedCount = 0;

    for (const product of eventimProducts) {
      const le = product.typeAttributes.liveEntertainment;
      const startDate = new Date(le.startDate);
      const eventDate = le.startDate.substring(0, 10); // YYYY-MM-DD
      const dd = String(startDate.getDate()).padStart(2, '0');
      const mm = String(startDate.getMonth() + 1).padStart(2, '0');
      const yyyy = startDate.getFullYear();
      const dateStr = `${dd}.${mm}.${yyyy}`;
      const dayName = getDayName(le.startDate);
      const city = cleanCityName(le.location.city);
      const ticketUrl = ensureAffiliateParams(product.link);

      const eventData = {
        date: dateStr,
        day: dayName,
        city,
        venue: le.location.name,
        ticket_url: ticketUrl,
        event_date: eventDate,
        is_active: true,
        last_synced_at: new Date().toISOString(),
        ...(le.location.geoLocation ? {
          latitude: le.location.geoLocation.latitude,
          longitude: le.location.geoLocation.longitude,
        } : {}),
      };

      // Prüfe ob Event bereits existiert
      const { data: existing } = await supabase
        .from('tour_events')
        .select('id')
        .eq('event_date', eventDate)
        .eq('city', city)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('tour_events')
          .update(eventData)
          .eq('id', existing.id);
        if (!updateError) {
          updatedCount++;
          console.log(`Updated: ${city} - ${dateStr} → ${ticketUrl.substring(0, 70)}...`);
        } else {
          console.error(`Error updating ${city}:`, updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('tour_events')
          .insert(eventData);
        if (!insertError) {
          insertedCount++;
          console.log(`Inserted: ${city} - ${dateStr} → ${ticketUrl.substring(0, 70)}...`);
        } else {
          console.error(`Error inserting ${city}:`, insertError);
        }
      }
    }

    console.log('=== KBA Sync Complete ===');
    console.log(`KBA Total: ${eventimProducts.length} (${insertedCount} new, ${updatedCount} updated)`);

    // === Step 4: KL Events synchen ===
    console.log('Step 4: Syncing KL events from admin_events...');

    let klInserted = 0;
    let klUpdated = 0;

    const { error: klDeactivateError } = await supabase
      .from('tour_events')
      .update({ is_active: false })
      .eq('source', 'KL')
      .eq('is_active', true);

    if (klDeactivateError) {
      console.error('Error deactivating KL events:', klDeactivateError);
    }

    const { data: klEvents, error: klFetchError } = await supabase
      .from('admin_events')
      .select('*')
      .eq('source', 'KL')
      .eq('ticket_url_approved', true)
      .not('ticket_url', 'is', null)
      .is('deleted_at', null)
      .order('start_time', { ascending: true });

    if (klFetchError) {
      console.error('Error fetching KL events:', klFetchError);
    } else if (klEvents && klEvents.length > 0) {
      console.log(`Found ${klEvents.length} KL events in admin_events`);

      const dayNames: Record<string, string> = {
        '0': 'Sonntag', '1': 'Montag', '2': 'Dienstag', '3': 'Mittwoch',
        '4': 'Donnerstag', '5': 'Freitag', '6': 'Samstag',
      };

      for (const klEvent of klEvents) {
        const startDate = new Date(klEvent.start_time);
        const eventDate = startDate.toISOString().split('T')[0];
        const dd = String(startDate.getDate()).padStart(2, '0');
        const mm = String(startDate.getMonth() + 1).padStart(2, '0');
        const yyyy = startDate.getFullYear();
        const dateStr = `${dd}.${mm}.${yyyy}`;
        const dayName = dayNames[String(startDate.getDay())];
        const hours = String(startDate.getHours()).padStart(2, '0');
        const mins = String(startDate.getMinutes()).padStart(2, '0');
        const dayDisplay = `${dayName.substring(0, 2)}. ${hours}:${mins}`;

        const ticketUrl = (klEvent.ticket_url_approved && klEvent.ticket_url)
          ? klEvent.ticket_url
          : null;

        const tourEventData = {
          date: dateStr,
          day: dayDisplay,
          city: klEvent.location,
          venue: klEvent.venue_name || klEvent.location,
          note: klEvent.note || null,
          ticket_url: ticketUrl,
          event_date: eventDate,
          is_active: true,
          source: 'KL',
          latitude: klEvent.latitude,
          longitude: klEvent.longitude,
          last_synced_at: new Date().toISOString(),
        };

        const { data: existingKl } = await supabase
          .from('tour_events')
          .select('id')
          .eq('event_date', eventDate)
          .eq('city', klEvent.location)
          .eq('source', 'KL')
          .maybeSingle();

        if (existingKl) {
          const { error: updateErr } = await supabase
            .from('tour_events')
            .update(tourEventData)
            .eq('id', existingKl.id);
          if (!updateErr) {
            klUpdated++;
            console.log(`KL Updated: ${klEvent.location} - ${dateStr}`);
          }
        } else {
          const { error: insertErr } = await supabase
            .from('tour_events')
            .insert(tourEventData);
          if (!insertErr) {
            klInserted++;
            console.log(`KL Inserted: ${klEvent.location} - ${dateStr}`);
          }
        }
      }
    } else {
      console.log('No KL events found in admin_events');
    }

    console.log('=== Full Sync Complete ===');
    console.log(`KBA: ${eventimProducts.length} (${insertedCount} new, ${updatedCount} updated)`);
    console.log(`KL: ${klEvents?.length || 0} (${klInserted} new, ${klUpdated} updated)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${eventimProducts.length} KBA + ${klEvents?.length || 0} KL events`,
        kba: {
          eventsFound: eventimProducts.length,
          inserted: insertedCount,
          updated: updatedCount,
        },
        kl: {
          eventsFound: klEvents?.length || 0,
          inserted: klInserted,
          updated: klUpdated,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await sendErrorEmail(errorMessage, 'Main Process');

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
