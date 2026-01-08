import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedBooking {
  booking_type: "hotel" | "train" | "flight" | "bus" | "rental_car" | "other";
  booking_number?: string;
  provider?: string;
  traveler_name?: string;
  traveler_names?: string[];
  start_datetime: string;
  end_datetime?: string;
  origin_city?: string;
  destination_city: string;
  venue_name?: string;
  venue_address?: string;
  details: Record<string, any>;
  confidence: number;
}

interface AIAnalysisResult {
  bookings: ExtractedBooking[];
  is_update: boolean;
  update_booking_id?: string;
  change_summary?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { email_id } = await req.json();

    if (!email_id) {
      throw new Error("email_id is required");
    }

    console.log("Analyzing email:", email_id);

    // Fetch the email
    const { data: email, error: emailError } = await supabase
      .from("travel_emails")
      .select("*")
      .eq("id", email_id)
      .single();

    if (emailError || !email) {
      throw new Error(`Email not found: ${emailError?.message}`);
    }

    // Fetch attachments for context
    const { data: attachments } = await supabase
      .from("travel_attachments")
      .select("*")
      .eq("email_id", email_id);

    // Fetch existing bookings to detect updates
    const { data: existingBookings } = await supabase
      .from("travel_bookings")
      .select("id, booking_number, traveler_name, traveler_names, start_datetime, destination_city, booking_type")
      .order("created_at", { ascending: false })
      .limit(100);

    // Build prompt for AI
    const emailContent = `
E-Mail von: ${email.from_address}
Betreff: ${email.subject}
Datum: ${email.received_at}

Inhalt:
${email.body_text || email.body_html?.replace(/<[^>]*>/g, ' ') || '(kein Inhalt)'}

Anhänge: ${attachments?.map(a => a.file_name).join(", ") || "keine"}
    `.trim();

    const existingBookingsContext = existingBookings?.length 
      ? `\n\nBereits erfasste Buchungen (zum Erkennen von Updates):\n${existingBookings.map(b => 
          `- ${b.booking_type}: ${b.booking_number || 'ohne Nr.'}, ${b.traveler_name || b.traveler_names?.join(', ')}, ${b.destination_city}, ${new Date(b.start_datetime).toLocaleDateString('de-DE')}`
        ).join('\n')}`
      : '';

    const systemPrompt = `Du bist ein Experte für die Analyse von Reisebuchungs-E-Mails. Extrahiere alle Buchungsinformationen aus der E-Mail.

Für jede gefundene Buchung extrahiere:
- booking_type: "hotel", "train", "flight", "bus", "rental_car" oder "other"
- booking_number: Buchungsnummer/Reservierungscode
- provider: Anbieter (z.B. "Deutsche Bahn", "Lufthansa", "Marriott")
- traveler_name: Name des Hauptreisenden
- traveler_names: Array aller Reisenden (falls mehrere)
- start_datetime: Check-in/Abfahrt (ISO 8601 Format, z.B. "2026-11-12T15:00:00")
- end_datetime: Check-out/Ankunft (ISO 8601 Format)
- origin_city: Startort (bei Transport)
- destination_city: Zielort/Hotelstadt (PFLICHT)
- venue_name: Hotel-/Bahnhofsname
- venue_address: Vollständige Adresse
- details: Zusatzinfos als Objekt, z.B.:
  - Für Hotels: room_category, breakfast_included, room_number, wifi_included
  - Für Züge: train_number, wagon, seat, class
  - Für Flüge: flight_number, terminal, gate, seat, baggage
- confidence: Deine Sicherheit bei der Extraktion (0.0 bis 1.0)

Prüfe auch, ob es sich um ein UPDATE einer bestehenden Buchung handelt (gleiche Buchungsnummer oder gleicher Reisender + Datum + Typ). Falls ja, setze is_update: true und gib die update_booking_id an.

${existingBookingsContext}`;

    // Call Lovable AI (Gemini)
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: emailContent }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_bookings",
              description: "Extrahiere Buchungsinformationen aus der E-Mail",
              parameters: {
                type: "object",
                properties: {
                  bookings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        booking_type: { type: "string", enum: ["hotel", "train", "flight", "bus", "rental_car", "other"] },
                        booking_number: { type: "string" },
                        provider: { type: "string" },
                        traveler_name: { type: "string" },
                        traveler_names: { type: "array", items: { type: "string" } },
                        start_datetime: { type: "string" },
                        end_datetime: { type: "string" },
                        origin_city: { type: "string" },
                        destination_city: { type: "string" },
                        venue_name: { type: "string" },
                        venue_address: { type: "string" },
                        details: { type: "object" },
                        confidence: { type: "number" }
                      },
                      required: ["booking_type", "start_datetime", "destination_city"]
                    }
                  },
                  is_update: { type: "boolean" },
                  update_booking_id: { type: "string" },
                  change_summary: { type: "string" }
                },
                required: ["bookings", "is_update"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_bookings" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits exhausted. Please add funds.");
      }
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData, null, 2));

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.log("No bookings found in email");
      await supabase
        .from("travel_emails")
        .update({ status: "processed", error_message: "Keine Buchungen gefunden" })
        .eq("id", email_id);
      
      return new Response(
        JSON.stringify({ success: true, bookings_created: 0, message: "No bookings found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysisResult: AIAnalysisResult = JSON.parse(toolCall.function.arguments);
    console.log("Extracted bookings:", analysisResult.bookings.length);

    let bookingsCreated = 0;
    let bookingsUpdated = 0;

    for (const booking of analysisResult.bookings) {
      try {
        // Check if this is an update to an existing booking
        let existingBookingId: string | null = null;
        
        if (booking.booking_number) {
          const { data: existing } = await supabase
            .from("travel_bookings")
            .select("id")
            .eq("booking_number", booking.booking_number)
            .single();
          
          if (existing) {
            existingBookingId = existing.id;
          }
        }

        if (existingBookingId) {
          // This is an update - save version history first
          const { data: currentBooking } = await supabase
            .from("travel_bookings")
            .select("*")
            .eq("id", existingBookingId)
            .single();

          if (currentBooking) {
            // Get current version count
            const { count } = await supabase
              .from("booking_versions")
              .select("*", { count: "exact", head: true })
              .eq("booking_id", existingBookingId);

            // Save version
            await supabase
              .from("booking_versions")
              .insert({
                booking_id: existingBookingId,
                version_number: (count || 0) + 1,
                previous_data: currentBooking,
                change_summary: analysisResult.change_summary || "Buchung aktualisiert",
                changed_by: "ai",
                source_email_id: email_id,
              });

            // Update the booking
            await supabase
              .from("travel_bookings")
              .update({
                booking_type: booking.booking_type,
                booking_number: booking.booking_number,
                provider: booking.provider,
                traveler_name: booking.traveler_name,
                traveler_names: booking.traveler_names,
                start_datetime: booking.start_datetime,
                end_datetime: booking.end_datetime,
                origin_city: booking.origin_city,
                destination_city: booking.destination_city,
                venue_name: booking.venue_name,
                venue_address: booking.venue_address,
                details: booking.details || {},
                status: "changed",
                source_email_id: email_id,
                ai_confidence: booking.confidence,
              })
              .eq("id", existingBookingId);

            bookingsUpdated++;
          }
        } else {
          // Create new booking
          const { error: insertError } = await supabase
            .from("travel_bookings")
            .insert({
              booking_type: booking.booking_type,
              booking_number: booking.booking_number,
              provider: booking.provider,
              traveler_name: booking.traveler_name,
              traveler_names: booking.traveler_names,
              start_datetime: booking.start_datetime,
              end_datetime: booking.end_datetime,
              origin_city: booking.origin_city,
              destination_city: booking.destination_city,
              venue_name: booking.venue_name,
              venue_address: booking.venue_address,
              details: booking.details || {},
              status: "confirmed",
              source_email_id: email_id,
              ai_confidence: booking.confidence,
            });

          if (insertError) {
            console.error("Error inserting booking:", insertError);
          } else {
            bookingsCreated++;
          }
        }
      } catch (bookingError) {
        console.error("Error processing booking:", bookingError);
      }
    }

    // Update email status
    await supabase
      .from("travel_emails")
      .update({ status: "processed" })
      .eq("id", email_id);

    console.log(`Processed: ${bookingsCreated} created, ${bookingsUpdated} updated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookings_created: bookingsCreated,
        bookings_updated: bookingsUpdated 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
