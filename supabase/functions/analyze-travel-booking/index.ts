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
  needs_review?: boolean;
  is_proposal?: boolean;
  proposal_reason?: string;
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

=== ⚠️ KRITISCH: ANGEBOTE VS. ECHTE BUCHUNGEN UNTERSCHEIDEN ⚠️ ===

Dies ist die WICHTIGSTE Prüfung! Bei JEDER gefundenen Reiseoption:

1. IST ES EIN ANGEBOT/VORSCHLAG? (is_proposal: true)
   Indikatoren für ANGEBOTE:
   - "nicht optioniert", "Preise können variieren", "unverbindlich"
   - "Am besten ... buchen" (= Empfehlung, noch nicht gebucht!)
   - "Die folgenden Sachen fehlen noch", "müssen noch gebucht werden"
   - "möchte ich vorher bestätigen lassen", "zur Auswahl"
   - MEHRERE Hotels/Flüge für gleichen Zeitraum ohne eindeutige Buchungsnummer
   - E-Mail-Kontext zeigt Angebotsphase (z.B. von Reiseagentur an Kunden)
   - KEINE Buchungsnummer / Confirmation Number vorhanden
   - Text enthält "Optionen", "Alternativen", "Vorschläge"

2. IST ES EINE ECHTE BUCHUNG? (is_proposal: false)
   Indikatoren für ECHTE BUCHUNGEN:
   - Buchungsbestätigung mit Confirmation Number / Buchungsnummer
   - "Ihre Buchung wurde bestätigt", "gebucht", "reserviert" (= abgeschlossen!)
   - Ticket-PDF oder Voucher als Attachment
   - E-Mail DIREKT vom Anbieter (hotel@marriott.com, buchung@bahn.de, etc.)
   - Zahlungsbestätigung oder Rechnung mit Buchungsnummer
   - Check-in-Informationen (= Buchung muss existieren)

3. ENTSCHEIDUNGSLOGIK:
   A) MEHRERE Hotels/Optionen für gleichen Zeitraum → ALLE als Angebot (is_proposal: true)
      Beispiel: "Leonardo Hotel 89€ oder Marriott 120€" → BEIDE als proposal!
   B) KEINE Buchungsnummer UND Angebots-Indikatoren → proposal
   C) Buchungsnummer + Bestätigungshinweis → echte Buchung (is_proposal: false)
   D) Im Zweifel: Als Angebot markieren mit needs_review: true

4. SETZE proposal_reason WENN is_proposal = true:
   - "Mehrere Optionen ohne finale Entscheidung"
   - "Angebotsmail ohne Buchungsbestätigung"
   - "Keine Buchungsnummer vorhanden"
   - "Text enthält 'zur Auswahl' / 'Optionen'"

5. ANGEBOTE KOMPLETT IGNORIEREN WENN:
   - Später in der E-Mail eine ECHTE Buchung für denselben Zeitraum existiert
   - Beispiel: Leonardo (Option) + Marriott (gebucht) → NUR Marriott speichern!

=== KRITISCH: BOOKING_TYPE KORREKT ERKENNEN ===
Erkenne den booking_type NICHT am Preis oder an vagen Hinweisen, sondern am ANBIETER:
- "Deutsche Bahn", "DB", "ICE", "IC", "RE", "S-Bahn", "RB", "EC", "TGV" → booking_type: "train"
- "Lufthansa", "Eurowings", "Ryanair", "easyJet", "Swiss", "Austrian", "KLM", "Flug" → booking_type: "flight"
- "FlixBus", "BlaBlaBus", "Fernbus" → booking_type: "bus"
- "Marriott", "Hilton", "Radisson", "Holiday Inn", "Booking.com", "HRS", "Hotel" → booking_type: "hotel"
- "Sixt", "Europcar", "Enterprise", "Hertz", "Avis" → booking_type: "rental_car"

NIEMALS Deutsche Bahn Tickets als "flight" klassifizieren!
NIEMALS Flugtickets als "train" klassifizieren!

=== KRITISCH: KEINE ROUTEN ERFINDEN ===
Wenn für eine Person KEINE explizite Route (Start → Ziel) angegeben ist:
1. NIEMALS die Route einer anderen Person übertragen
2. NIEMALS eine Route raten oder erfinden
3. Stattdessen: Diese Buchung NICHT erstellen

Beispiel aus einer E-Mail:
"Am 10. Januar - Stefanie Sick - 64,55 EUR Flexpreis" (KEINE Route!)
"Am 10. Januar - Wanja Mues - Bremen → Berlin Hbf"
→ Erstelle Buchung NUR für Wanja, NICHT für Stefanie!

=== VALIDIERUNG: BUCHUNG ÜBERSPRINGEN WENN ===
- booking_number = "reserviert" → Das ist KEINE echte Buchungsnummer!
- origin_city = destination_city → Das ist ein Datenfehler!
- Keine echte Uhrzeit und keine Route → Unvollständige Daten!
- Nur Preis ohne konkrete Reisedaten → Zu wenig Information!

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

=== DOKUMENTTYP ERKENNEN (WICHTIG!) ===
Erkenne den Typ des Dokuments und setze details.document_type:
- "ticket" = Echte Fahrkarte / Flugticket mit Buchungsnummer zum Reisen
- "seat_reservation" = NUR Sitzplatzreservierung (ohne eigentliches Ticket)
- "confirmation" = Buchungsbestätigung (z.B. Hotel-Bestätigung)
- "invoice" = Rechnung
- "unknown" = Typ unklar

WICHTIG bei Bahntickets:
- Wenn Betreff/Dokument "Sitzplatzreservierung" enthält und KEIN Fahrpreis → document_type: "seat_reservation"
- Wenn "Reservierung" UND ein Fahrpreis/Ticketpreis → document_type: "ticket"
- Setze auch is_seat_reservation: true wenn es NUR eine Reservierung ist

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

WICHTIG: Das Wort "reserviert" ist KEINE Buchungsnummer!
- "reserviert" bedeutet nur, dass eine Reservierung existiert
- Die echte Buchungs-/Auftragsnummer ist ein alphanumerischer Code (z.B. "7081410162726208", "Q7K5M2")
- NIEMALS "reserviert", "pending", "ohne Nr." als booking_number speichern!

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

=== VALIDIERUNG: KEINE UNKNOWN STÄDTE ===
NIEMALS eine Buchung erstellen mit:
- destination_city = "Unknown" oder "Unbekannt"
- origin_city = "Unknown" (bei Zügen/Flügen/Bussen)
- Leere oder fehlende Stadt-Felder bei Transport-Buchungen

Wenn die Route nicht eindeutig erkennbar ist:
- Suche im GESAMTEN Kontext der E-Mail nach Hinweisen
- Schaue ob andere Buchungen am gleichen Tag die Route verraten
- Wenn das Ziel immer noch unklar: Setze confidence auf < 0.3

=== WICHTIG: KONTEXT NUTZEN ===
Wenn in der E-Mail MEHRERE PERSONEN am GLEICHEN TAG reisen:
- Wenn bei Person A die Route "Hamburg → Bremen" steht
- Und Person B reist am gleichen Tag ohne explizite Route
- Dann übertrage die Route auf Person B!

Beispiel:
"Am 8. Januar - Wanja Mues - Hamburg Hbf → Bremen Hbf - 59,60 EUR"
"Am 8. Januar - Antoine Monot - 59,60 EUR" (keine Route genannt)
→ Antoine fährt AUCH Hamburg → Bremen! Übernehme die Route!

=== CITY-TICKET-GÜLTIGKEIT (BAHN) ===
Wenn in der E-Mail oder im PDF "City-Ticket-Gültigkeit" steht, extrahiere in details:
- city_ticket_start: { validity: "10.01.26–11.01.26, 3:00 Uhr", zone: "Stadtgebiet Bremen (Tarifgebiet 1, Zone 100 + 101)" }
- city_ticket_destination: { validity: "10.01.26–11.01.26, 3:00 Uhr", zone: "Stadtgebiet Hannover (Ticket-Zone A)" }

Beispiel aus E-Mail:
"City-Ticket-Gültigkeit
Start: 10.01.26–11.01.26, 3:00 Uhr; Stadtgebiet Bremen (Tarifgebiet 1, Zone 100 + 101)
Ziel: 10.01.26–11.01.26, 3:00 Uhr; Stadtgebiet Hannover (Ticket-Zone A)"

→ city_ticket_start = { validity: "10.01.26–11.01.26, 3:00 Uhr", zone: "Stadtgebiet Bremen (Tarifgebiet 1, Zone 100 + 101)" }
→ city_ticket_destination = { validity: "10.01.26–11.01.26, 3:00 Uhr", zone: "Stadtgebiet Hannover (Ticket-Zone A)" }

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
                            // Document type (NEW - for proper labeling in UI)
                            document_type: { 
                              type: "string", 
                              enum: ["ticket", "seat_reservation", "confirmation", "invoice", "unknown"],
                              description: "Art des Dokuments: ticket=Fahrkarte/Flugticket, seat_reservation=Sitzplatzreservierung, confirmation=Buchungsbestätigung, invoice=Rechnung"
                            },
                            is_seat_reservation: { type: "boolean", description: "Ist es NUR eine Sitzplatzreservierung (ohne Fahrkarte)?" },
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
                        confidence: { type: "number" },
                        is_proposal: { type: "boolean", description: "true wenn es nur ein Angebot/Vorschlag ist, false wenn echte Buchung" },
                        proposal_reason: { type: "string", description: "Grund warum es ein Angebot ist (z.B. 'Mehrere Optionen ohne Entscheidung')" }
                      },
                      required: ["booking_type", "start_datetime", "destination_city", "details", "is_proposal"]
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

    // Post-processing: Fix obviously wrong booking_type classifications
    for (const booking of analysisResult.bookings) {
      const providerLower = (booking.provider || '').toLowerCase();
      const detailsStr = JSON.stringify(booking.details || {}).toLowerCase();
      
      // Deutsche Bahn should always be train, never flight
      if ((providerLower.includes('deutsche bahn') || providerLower.includes('db ') || providerLower === 'db') 
          && booking.booking_type === 'flight') {
        console.log(`Correcting Deutsche Bahn from flight to train for ${booking.traveler_name}`);
        booking.booking_type = 'train';
      }
      
      // Detect train keywords in details
      if (detailsStr.includes('ice ') || detailsStr.includes('ic ') || detailsStr.includes('re ') || 
          detailsStr.includes('rb ') || detailsStr.includes('s-bahn') || detailsStr.includes('zugnummer')) {
        if (booking.booking_type === 'flight') {
          console.log(`Correcting booking_type from flight to train based on train keywords`);
          booking.booking_type = 'train';
        }
      }
    }

    let bookingsCreated = 0;
    let bookingsUpdated = 0;

    for (const booking of analysisResult.bookings) {
      try {
        // Ensure details is always an object
        const bookingDetails = booking.details || {};
        
        // ========== FALLBACK: document_type automatisch erkennen ==========
        if (!bookingDetails.document_type && booking.booking_type === 'train') {
          const totalAmount = bookingDetails.total_amount;
          const hasSeatInfo = bookingDetails.wagon || bookingDetails.seat || bookingDetails.coach;
          const subjectContainsReservation = email.subject?.toLowerCase().includes('sitzplatzreservierung') ||
                                              email.subject?.toLowerCase().includes('reservierung');
          
          // Sitzplatzreservierung: Preis 0 (oder fehlt) UND Sitzplatz-Info ODER Betreff enthält "Reservierung"
          const isReservation = 
            ((totalAmount === 0 || totalAmount === null || totalAmount === undefined) && hasSeatInfo) ||
            subjectContainsReservation;
          
          if (isReservation) {
            bookingDetails.document_type = 'seat_reservation';
            console.log('Fallback: document_type set to seat_reservation (price=0 or subject contains reservation)');
          } else if (totalAmount && totalAmount > 0) {
            bookingDetails.document_type = 'ticket';
            console.log('Fallback: document_type set to ticket (has price)');
          }
        }
        
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

            // Fix placeholder booking_number on update too
            const placeholderValues = ['reserviert', 'ohne nr.', 'ohne nr', 'pending', 'n/a', 'tba', 'unknown', '-', '–'];
            let updatedBookingNumber = booking.booking_number;
            const isPlaceholder = !updatedBookingNumber || 
              placeholderValues.includes(updatedBookingNumber.toLowerCase().trim());
            
            if (isPlaceholder && bookingDetails.order_number && 
                !placeholderValues.includes(String(bookingDetails.order_number).toLowerCase().trim())) {
              updatedBookingNumber = bookingDetails.order_number;
              console.log(`Corrected placeholder booking_number on update to: ${updatedBookingNumber}`);
            }

            // Update the booking
            await supabase
              .from("travel_bookings")
              .update({
                booking_type: booking.booking_type,
                booking_number: updatedBookingNumber,
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
          // ===== DUPLICATE CHECK BEFORE INSERT =====
          const bookingDate = new Date(booking.start_datetime);
          const dateStr = bookingDate.toISOString().split('T')[0];
          const travelerName = booking.traveler_name || (booking.traveler_names?.length ? booking.traveler_names[0] : null);
          
          if (travelerName && booking.destination_city) {
            let duplicateQuery = supabase
              .from("travel_bookings")
              .select("id")
              .eq("booking_type", booking.booking_type)
              .eq("destination_city", booking.destination_city)
              .gte("start_datetime", `${dateStr}T00:00:00`)
              .lte("start_datetime", `${dateStr}T23:59:59`);
            
            duplicateQuery = duplicateQuery.or(`traveler_name.ilike.%${travelerName}%,traveler_names.cs.{"${travelerName}"}`);
            
            const { data: duplicates } = await duplicateQuery.limit(1);
            
            if (duplicates && duplicates.length > 0) {
              console.log(`Skipping duplicate: ${travelerName} → ${booking.destination_city} on ${dateStr}`);
              continue;
            }
          }
          
          // Post-processing: Ensure booking_number is set from details if missing or placeholder
          let finalBookingNumber = booking.booking_number;
          const placeholderValues = ['reserviert', 'ohne nr.', 'ohne nr', 'pending', 'n/a', 'tba', 'unknown', '-', '–'];
          const isPlaceholder = !finalBookingNumber || 
            placeholderValues.includes(finalBookingNumber.toLowerCase().trim());
          
          // If booking_number is missing or a placeholder, try to get from details
          if (isPlaceholder && bookingDetails.order_number && 
              !placeholderValues.includes(String(bookingDetails.order_number).toLowerCase().trim())) {
            finalBookingNumber = bookingDetails.order_number;
            console.log(`Corrected placeholder booking_number to: ${finalBookingNumber}`);
          }
          
          // Validate destination_city - skip bookings with Unknown
          const invalidCities = ['unknown', 'unbekannt', '', null, undefined];
          const finalDestination = booking.destination_city;
          const finalOrigin = booking.origin_city;
          
          if (!finalDestination || invalidCities.includes(finalDestination.toLowerCase?.().trim())) {
            console.log(`Skipping booking with invalid destination_city: ${finalDestination}`);
            continue;
          }
          
          // Skip if origin = destination (data error)
          if (finalOrigin && finalDestination && 
              finalOrigin.toLowerCase().trim() === finalDestination.toLowerCase().trim()) {
            console.log(`Skipping booking where origin = destination: ${finalOrigin}`);
            continue;
          }
          
          // Check if transport booking has valid origin - skip entirely if missing
          const isTransport = ['train', 'flight', 'bus'].includes(booking.booking_type);
          
          if (isTransport && (!finalOrigin || invalidCities.includes(finalOrigin.toLowerCase?.().trim()))) {
            console.log(`Skipping transport booking without valid origin_city for ${travelerName}`);
            continue;
          }
          
          // Determine status based on is_proposal
          const bookingStatus = booking.is_proposal ? "proposal" : "confirmed";
          
          // Add proposal_reason to details if applicable
          if (booking.is_proposal && booking.proposal_reason) {
            bookingDetails.proposal_reason = booking.proposal_reason;
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
              origin_city: finalOrigin,
              destination_city: finalDestination,
              venue_name: booking.venue_name,
              venue_address: booking.venue_address,
              details: bookingDetails,
              status: bookingStatus,
              source_email_id: email_id,
              ai_confidence: booking.confidence || 1,
              needs_review: booking.is_proposal ? true : false,
            });

          if (insertError) {
            console.error("Error inserting booking:", insertError);
          } else {
            bookingsCreated++;
            
            // ========== PDF RENAMING BASED ON DOCUMENT TYPE ==========
            // Get the newly inserted booking ID to link attachments
            const { data: insertedBooking } = await supabase
              .from("travel_bookings")
              .select("id")
              .eq("source_email_id", email_id)
              .eq("booking_number", finalBookingNumber)
              .eq("start_datetime", booking.start_datetime)
              .single();
            
            if (insertedBooking) {
              // Bestimme document_type - nutze AI-Wert oder Fallback
              let documentType = bookingDetails.document_type;
              
              // Sekundärer Fallback basierend auf Attachment-Namen wenn document_type fehlt
              if (!documentType) {
                const { data: emailAttachments } = await supabase
                  .from("travel_attachments")
                  .select("file_name")
                  .eq("email_id", email_id);
                
                const hasReservationFile = emailAttachments?.some(a => 
                  a.file_name.toLowerCase().includes('reservierung') ||
                  a.file_name.toLowerCase().includes('sitzplatz') ||
                  a.file_name.toLowerCase().includes('reservation')
                );
                
                // Default: ticket für Zug wenn nichts anderes zutrifft
                documentType = hasReservationFile ? 'seat_reservation' : 
                               (booking.booking_type === 'train' ? 'ticket' : null);
                
                if (documentType) {
                  console.log(`Attachment-Fallback: document_type set to ${documentType}`);
                }
              }
              
              const travelerShortName = travelerName?.split(' ')[1] || travelerName?.split(' ')[0] || 'Unbekannt';
              
              let newFileName = "";
              
              if (documentType === 'seat_reservation') {
                const trainNum = bookingDetails.train_number || bookingDetails.ice_number || 'Zug';
                newFileName = `Reservierung_${trainNum}_${travelerShortName}.pdf`;
              } else if (documentType === 'ticket') {
                newFileName = `Ticket_${finalBookingNumber || 'ID'}_${travelerShortName}.pdf`;
              } else if (documentType === 'confirmation') {
                newFileName = `Bestaetigung_${travelerShortName}.pdf`;
              }
              
              // IMMER Attachments verknüpfen, auch wenn kein Rename
              const updateData: Record<string, any> = { booking_id: insertedBooking.id };
              if (documentType) updateData.document_type = documentType;
              if (newFileName) updateData.file_name = newFileName;
              
              const { error: attachUpdateError } = await supabase
                .from("travel_attachments")
                .update(updateData)
                .eq("email_id", email_id)
                .is("booking_id", null); // Only update unlinked attachments
              
              if (attachUpdateError) {
                console.error("Error updating attachment:", attachUpdateError);
              } else if (newFileName) {
                console.log(`Renamed attachment to: ${newFileName}`);
              } else {
                console.log(`Linked attachments to booking ${insertedBooking.id}`);
              }
            }
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
