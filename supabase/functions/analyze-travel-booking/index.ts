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

    console.log("Found attachments:", attachments?.length || 0);

    // ========== EXTRACT CONTENT FROM PDF AND IMAGE ATTACHMENTS ==========
    let attachmentContents = "";
    
const extractionPrompt = `Extrahiere ALLE Informationen aus diesem Reisedokument/Ticket. Gib die Daten strukturiert zurück:

Für Bahntickets:
- Auftragsnummer / Buchungsnummer (SEHR WICHTIG!)
- Zugnummer(n) (z.B. ICE 1044)
- Abfahrt: Ort, Datum, Uhrzeit
- Ankunft: Ort, Datum, Uhrzeit
- Klasse (1 oder 2)
- Wagen und Sitzplatz
- Reisende(r) Name(n)
- Preis / Gesamtbetrag
- Währung (EUR, USD, CHF, etc.)
- BahnCard falls vorhanden
- QR-CODE: Falls ein QR-Code sichtbar ist, beschreibe dessen Position und möglichen Inhalt (Ticket-URL, Buchungscode, etc.)
- BARCODE: Falls ein Barcode sichtbar ist, notiere die Zahlen/Buchstaben darunter

Für Flugtickets:
- Buchungscode / PNR
- Flugnummer
- Abflug/Ankunft Ort, Datum, Uhrzeit
- Terminal, Gate
- Passagier(e)
- Preis / Gesamtbetrag
- Währung
- Boarding-Pass QR-Code vorhanden? (ja/nein)
- Online Check-in URL falls vorhanden

Für Hotelbestätigungen:
- Buchungsnummer
- Hotelname und Adresse
- Hotel Website URL
- Check-in / Check-out Datum und Uhrzeit
- Zimmertyp
- Gast(en) Name(n)
- Preis pro Nacht und Gesamtpreis
- Währung
- Frühstück inklusive? (ja/nein)
- WLAN inklusive? (ja/nein)
- Stornierungsbedingungen

Für Rechnungen:
- Rechnungsnummer / Auftragsnummer
- Gesamtbetrag
- Währung
- Zahlungsstatus

WICHTIG: Achte besonders auf:
1. QR-Codes - beschreibe Position und vermuteten Inhalt
2. Barcodes - notiere Nummern darunter
3. URLs im Dokument - besonders Ticket-URLs, Check-in-Links
4. Ticket-Typ: Ist es ein digitales Ticket / Handy-Ticket?

Gib alle gefundenen Informationen als lesbaren Text zurück.`;
    
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const isPdf = attachment.content_type?.includes('pdf') || attachment.file_name?.toLowerCase().endsWith('.pdf');
        const isImage = attachment.content_type?.includes('image/') || 
                        attachment.file_name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff?)$/);
        
        if (isPdf || isImage) {
          const fileType = isPdf ? 'PDF' : 'Image';
          console.log(`Processing ${fileType} attachment: ${attachment.file_name}`);
          
          try {
            // Download file from Supabase Storage
            const { data: fileData, error: downloadError } = await supabase.storage
              .from("travel-attachments")
              .download(attachment.file_path);
            
            if (downloadError) {
              console.error(`Error downloading ${fileType} ${attachment.file_name}:`, downloadError);
              continue;
            }
            
            if (fileData) {
              // Convert blob to base64
              const arrayBuffer = await fileData.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              let binaryString = '';
              for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
              }
              const base64Content = btoa(binaryString);
              
              console.log(`${fileType} converted to base64, size: ${base64Content.length} chars`);
              
              // Determine MIME type
              let mimeType: string;
              if (isPdf) {
                mimeType = 'application/pdf';
              } else {
                // Infer from content_type or file extension
                mimeType = attachment.content_type || 'image/jpeg';
                if (!mimeType.startsWith('image/')) {
                  const ext = attachment.file_name?.toLowerCase().split('.').pop();
                  const mimeMap: Record<string, string> = {
                    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
                    'gif': 'image/gif', 'webp': 'image/webp', 'bmp': 'image/bmp',
                    'tiff': 'image/tiff', 'tif': 'image/tiff'
                  };
                  mimeType = mimeMap[ext || ''] || 'image/jpeg';
                }
              }
              
              // Use Gemini Vision to extract text
              const visionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${lovableApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [{
                    role: "user",
                    content: [
                      { type: "text", text: extractionPrompt },
                      { 
                        type: "image_url", 
                        image_url: { url: `data:${mimeType};base64,${base64Content}` } 
                      }
                    ]
                  }]
                }),
              });
              
              if (visionResponse.ok) {
                const visionData = await visionResponse.json();
                const extractedText = visionData.choices?.[0]?.message?.content || '';
                console.log(`Extracted from ${attachment.file_name}:`, extractedText.substring(0, 500));
                
                if (extractedText) {
                  attachmentContents += `\n\n=== INHALT AUS ANHANG "${attachment.file_name}" (${fileType}) ===\n${extractedText}`;
                }
              } else {
                const errorText = await visionResponse.text();
                console.error(`Vision API error for ${attachment.file_name}:`, errorText);
              }
            }
          } catch (fileError) {
            console.error(`Error processing ${fileType} ${attachment.file_name}:`, fileError);
          }
        } else {
          console.log(`Skipping non-analyzable attachment: ${attachment.file_name} (${attachment.content_type})`);
        }
      }
    }

    // Fetch existing bookings to detect updates
    const { data: existingBookings } = await supabase
      .from("travel_bookings")
      .select("id, booking_number, traveler_name, traveler_names, start_datetime, destination_city, booking_type")
      .order("created_at", { ascending: false })
      .limit(100);

    // Build prompt for AI - now including PDF content!
    const emailContent = `
E-Mail von: ${email.from_address}
Betreff: ${email.subject}
Datum: ${email.received_at}

Inhalt:
${email.body_text || email.body_html?.replace(/<[^>]*>/g, ' ') || '(kein Inhalt)'}

Anhänge: ${attachments?.map(a => a.file_name).join(", ") || "keine"}
${attachmentContents}
    `.trim();

    console.log("Email content length including attachments:", emailContent.length);

    const existingBookingsContext = existingBookings?.length 
      ? `\n\nBereits erfasste Buchungen (zum Erkennen von Updates):\n${existingBookings.map(b => 
          `- ${b.booking_type}: ${b.booking_number || 'ohne Nr.'}, ${b.traveler_name || b.traveler_names?.join(', ')}, ${b.destination_city}, ${new Date(b.start_datetime).toLocaleDateString('de-DE')}`
        ).join('\n')}`
      : '';

    const systemPrompt = `Du bist ein Experte für die Analyse von Reisebuchungs-E-Mails. Extrahiere ALLE Buchungsinformationen aus der E-Mail mit höchster Präzision.

Für jede gefundene Buchung extrahiere:
- booking_type: "hotel", "train", "flight", "bus", "rental_car" oder "other"
- booking_number: Buchungsnummer/Reservierungscode/Auftragsnummer (PFLICHT - siehe unten!)
- provider: Anbieter (z.B. "Deutsche Bahn", "Lufthansa", "Marriott")
- traveler_name: Name des Hauptreisenden
- traveler_names: Array aller Reisenden (falls mehrere)
- start_datetime: Check-in/Abfahrt (ISO 8601 Format, z.B. "2026-11-12T15:00:00")
- end_datetime: Check-out/Ankunft (ISO 8601 Format)
- origin_city: Startort (bei Transport)
- destination_city: Zielort/Hotelstadt (PFLICHT)
- venue_name: Hotel-/Bahnhofsname
- venue_address: Vollständige Adresse
- details: Zusatzinfos als Objekt (WICHTIG - extrahiere alle verfügbaren Details!)
- confidence: Deine Sicherheit bei der Extraktion (0.0 bis 1.0)

=== QR-CODES UND DIGITALE TICKETS ===
Extrahiere wenn vorhanden:
- qr_code_present: true/false - ob ein QR-Code sichtbar ist
- qr_code_description: Beschreibung des QR-Codes (z.B. "Großer QR-Code mittig, enthält Ticket-Daten")
- barcode_number: Falls Barcode vorhanden, die Nummer darunter
- ticket_url: URL zum Online-Ticket (z.B. bahn.de Link)
- mobile_ticket: true wenn es ein Handy-Ticket/Online-Ticket ist
- checkin_url: Online Check-in Link (bei Flügen)
- hotel_url: Website des Hotels

=== KRITISCH: BOOKING_NUMBER / AUFTRAGSNUMMER ===
Die booking_number ist das WICHTIGSTE Feld! Suche aktiv nach:

Bei Deutsche Bahn:
- "Auftragsnummer:" gefolgt von 6-stelligem Code (z.B. "Q7K5M2", "ABC123")
- "Ihre Bestellung" + Nummer
- Oft im Format: Großbuchstaben + Zahlen gemischt

Bei Hotels:
- "Bestätigungsnummer:", "Confirmation Number:", "Buchungsnummer:", "Reservierungsnummer:"
- Manchmal auch "Booking ID:", "Reference:", "Buchungs-ID:"

Bei Flügen:
- "PNR:", "Buchungscode:", "Booking Reference:"
- Meist 6-stellig, nur Buchstaben (z.B. "XYZABC")

WICHTIG: Setze booking_number UND details.order_number auf denselben Wert!

=== FINANZIELLE FELDER (IMMER EXTRAHIEREN WENN VORHANDEN) ===
- total_amount: Gesamtbetrag als ZAHL ohne Währungssymbol (z.B. 89.90, 156.50, 320.00)
- currency: Währungscode ISO 4217 (EUR, USD, CHF, GBP) - Standard ist EUR
- order_number: Auftrags-/Rechnungsnummer (oft identisch mit booking_number)

=== DETAILS-OBJEKT MUSS AUSGEFÜLLT WERDEN ===

Für ZUGBUCHUNGEN (train) - extrahiere IMMER in details:
- order_number: Auftragsnummer (PFLICHT - gleicher Wert wie booking_number!)
- train_number: Zugnummer (z.B. "ICE 1044", "IC 2023", "RE 5")
- class: Wagenklasse als Zahl ("1" oder "2")
- wagon: Wagennummer
- seat: Sitzplatznummer(n)
- bahncard: BahnCard-Typ (z.B. "BC 25", "BC 50", "BC 100", "BahnCard 25 1. Klasse")
- total_amount: Gesamtpreis als Zahl (z.B. 89.90)
- currency: Währung (EUR, USD, CHF, GBP)
- connection_type: "direkt" oder "mit Umstieg"
- cancellation_policy: Stornierungsbedingungen

Für FLUGBUCHUNGEN (flight) - extrahiere IMMER in details:
- order_number: Buchungscode/PNR (PFLICHT - gleicher Wert wie booking_number!)
- flight_number: Flugnummer (z.B. "LH 123", "EW 9876")
- airline: Fluggesellschaft
- terminal: Terminal-Nummer
- gate: Gate-Nummer
- seat: Sitzplatz
- baggage: Gepäckinfo (z.B. "23kg Freigepäck", "nur Handgepäck")
- booking_class: Buchungsklasse (z.B. "Economy", "Business")
- total_amount: Gesamtpreis als Zahl
- currency: Währung

Für HOTELBUCHUNGEN (hotel) - extrahiere IMMER in details:
- order_number: Buchungsnummer (PFLICHT - gleicher Wert wie booking_number!)
- hotel_url: Website-URL des Hotels (falls in der E-Mail enthalten)
- room_type: Zimmerkategorie (z.B. "Superior", "Komfort Plus", "Suite")
- room_number: Zimmernummer (falls bekannt)
- breakfast_included: true/false
- wifi_included: true/false
- price_per_night: Preis pro Nacht als Zahl
- total_amount: Gesamtpreis als Zahl
- currency: Währung
- cancellation_policy: Stornierungsbedingungen
- cancellation_deadline: Stornierungsfrist (ISO 8601 Datum)

Für MIETWAGEN (rental_car) - extrahiere in details:
- order_number: Buchungsnummer (PFLICHT!)
- vehicle_type: Fahrzeugkategorie
- pickup_location: Abholort
- dropoff_location: Rückgabeort
- total_amount: Gesamtpreis
- currency: Währung

WICHTIG:
- Extrahiere JEDES Detail das in der E-Mail steht
- booking_number ist PFLICHT wenn irgendwo eine Nummer steht!
- total_amount und currency IMMER extrahieren wenn Preise vorhanden sind
- Preise als Zahlen ohne Währungssymbol
- Boolean-Werte für ja/nein Felder
- Bei mehreren Verbindungen: Erstelle separate Buchungen ODER nutze das erste Segment

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
              description: "Extrahiere Buchungsinformationen aus der E-Mail mit allen verfügbaren Details",
              parameters: {
                type: "object",
                properties: {
                  bookings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        booking_type: { type: "string", enum: ["hotel", "train", "flight", "bus", "rental_car", "other"] },
                        booking_number: { type: "string", description: "Buchungsnummer, Auftragsnummer oder Reservierungscode" },
                        provider: { type: "string" },
                        traveler_name: { type: "string" },
                        traveler_names: { type: "array", items: { type: "string" } },
                        start_datetime: { type: "string" },
                        end_datetime: { type: "string" },
                        origin_city: { type: "string" },
                        destination_city: { type: "string" },
                        venue_name: { type: "string" },
                        venue_address: { type: "string" },
                        details: { 
                          type: "object",
                          description: "Alle extrahierten Details inkl. QR-Codes, URLs, Preise",
                          properties: {
                            // Financial fields (IMPORTANT)
                            total_amount: { type: "number", description: "Gesamtbetrag als Zahl (z.B. 89.90)" },
                            currency: { type: "string", enum: ["EUR", "USD", "CHF", "GBP"], description: "Währungscode" },
                            order_number: { type: "string", description: "Auftrags-/Rechnungsnummer" },
                            // QR-Code & Digital Ticket fields (NEW 2026!)
                            qr_code_present: { type: "boolean", description: "Ob ein QR-Code sichtbar ist" },
                            qr_code_description: { type: "string", description: "Beschreibung/Position des QR-Codes" },
                            barcode_number: { type: "string", description: "Barcode-Nummer falls sichtbar" },
                            ticket_url: { type: "string", description: "URL zum Online-Ticket" },
                            mobile_ticket: { type: "boolean", description: "Ist es ein Handy-Ticket?" },
                            checkin_url: { type: "string", description: "Online Check-in URL" },
                            // Train specific
                            train_number: { type: "string", description: "Zugnummer z.B. ICE 1044" },
                            class: { type: "string", description: "Wagenklasse 1 oder 2" },
                            wagon: { type: "string", description: "Wagennummer" },
                            seat: { type: "string", description: "Sitzplatz(e)" },
                            bahncard: { type: "string", description: "BahnCard Typ" },
                            connection_type: { type: "string", description: "direkt oder mit Umstieg" },
                            seat_type: { type: "string", description: "Fenster, Gang, Tisch, Ruhebereich, etc." },
                            // Flight specific
                            flight_number: { type: "string" },
                            airline: { type: "string" },
                            terminal: { type: "string" },
                            gate: { type: "string" },
                            baggage: { type: "string" },
                            booking_class: { type: "string", description: "Economy, Business, etc." },
                            // Hotel specific
                            room_type: { type: "string" },
                            room_number: { type: "string" },
                            breakfast_included: { type: "boolean" },
                            wifi_included: { type: "boolean" },
                            parking_included: { type: "boolean" },
                            price_per_night: { type: "number" },
                            total_nights: { type: "number" },
                            cancellation_policy: { type: "string" },
                            cancellation_deadline: { type: "string" },
                            hotel_url: { type: "string" },
                            hotel_phone: { type: "string" },
                            hotel_email: { type: "string" },
                            // Rental car specific
                            vehicle_type: { type: "string" },
                            pickup_location: { type: "string" },
                            dropoff_location: { type: "string" }
                          }
                        },
                        confidence: { type: "number" }
                      },
                      required: ["booking_type", "start_datetime", "destination_city", "details"]
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
    console.log("Booking details:", JSON.stringify(analysisResult.bookings.map(b => ({ type: b.booking_type, details: b.details })), null, 2));

    let bookingsCreated = 0;
    let bookingsUpdated = 0;

    for (const booking of analysisResult.bookings) {
      try {
        // Ensure details is always an object
        const bookingDetails = booking.details || {};
        
        // Check if this is an update to an existing booking
        let existingBookingId: string | null = null;
        
        // First try: Match by booking_number
        if (booking.booking_number) {
          const { data: existing } = await supabase
            .from("travel_bookings")
            .select("id")
            .eq("booking_number", booking.booking_number)
            .maybeSingle();
          
          if (existing) {
            existingBookingId = existing.id;
            console.log(`Matched by booking_number: ${booking.booking_number}`);
          }
        }
        
        // Fallback: Match by booking_type + traveler + destination + date (same day)
        if (!existingBookingId) {
          const bookingDate = new Date(booking.start_datetime);
          const dateStr = bookingDate.toISOString().split('T')[0];
          
          // Build query for matching
          let query = supabase
            .from("travel_bookings")
            .select("id, details")
            .eq("booking_type", booking.booking_type)
            .eq("destination_city", booking.destination_city)
            .gte("start_datetime", `${dateStr}T00:00:00`)
            .lte("start_datetime", `${dateStr}T23:59:59`);
          
          // Match by traveler name(s)
          const travelerName = booking.traveler_name || (booking.traveler_names?.length ? booking.traveler_names[0] : null);
          if (travelerName) {
            query = query.or(`traveler_name.ilike.%${travelerName}%,traveler_names.cs.{"${travelerName}"}`);
          }
          
          const { data: potentialMatches } = await query;
          
          if (potentialMatches && potentialMatches.length > 0) {
            // Take the first match (oldest entry for this criteria)
            existingBookingId = potentialMatches[0].id;
            console.log(`Matched by fallback (type+traveler+dest+date): ${existingBookingId}`);
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

            // Merge details - keep existing and add new
            const mergedDetails = {
              ...currentBooking.details,
              ...bookingDetails
            };

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
                details: mergedDetails,
                status: "changed",
                source_email_id: email_id,
                ai_confidence: booking.confidence,
              })
              .eq("id", existingBookingId);

            bookingsUpdated++;
          }
        } else {
          // Post-processing: Ensure booking_number is set from details if missing
          let finalBookingNumber = booking.booking_number;
          if (!finalBookingNumber && bookingDetails.order_number) {
            finalBookingNumber = bookingDetails.order_number;
            console.log(`Set booking_number from details.order_number: ${finalBookingNumber}`);
          }
          
          // Create new booking
          const { error: insertError } = await supabase
            .from("travel_bookings")
            .insert({
              booking_type: booking.booking_type,
              booking_number: finalBookingNumber,
              provider: booking.provider,
              traveler_name: booking.traveler_name,
              traveler_names: booking.traveler_names,
              start_datetime: booking.start_datetime,
              end_datetime: booking.end_datetime,
              origin_city: booking.origin_city,
              destination_city: booking.destination_city,
              venue_name: booking.venue_name,
              venue_address: booking.venue_address,
              details: bookingDetails,
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
