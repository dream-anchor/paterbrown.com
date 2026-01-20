import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export interface ExportEvent {
  id: string;
  title: string;
  location: string;
  venue_name?: string | null;
  start_time: string;
  end_time?: string | null;
  note?: string | null;
  source?: string;
}

export interface ExportOptions {
  events: ExportEvent[];
  template: "full" | "compact" | "public";
  filename?: string;
}

// Generate iCal format string
export const generateICalString = (options: ExportOptions): string => {
  const { events, template } = options;
  
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pater Brown Tour//Admin Calendar//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Pater Brown Tour",
    "X-WR-TIMEZONE:Europe/Berlin",
  ];

  events.forEach((event) => {
    const start = parseISO(event.start_time);
    const end = event.end_time ? parseISO(event.end_time) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    
    const formatDate = (d: Date) => {
      return format(d, "yyyyMMdd'T'HHmmss");
    };

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@paterbrown`);
    lines.push(`DTSTAMP:${formatDate(new Date())}`);
    lines.push(`DTSTART:${formatDate(start)}`);
    lines.push(`DTEND:${formatDate(end)}`);
    lines.push(`SUMMARY:${escapeICalText(event.title)}`);
    lines.push(`LOCATION:${escapeICalText([event.venue_name, event.location].filter(Boolean).join(", "))}`);
    
    if (template === "full" && event.note) {
      lines.push(`DESCRIPTION:${escapeICalText(event.note)}`);
    }
    
    if (template !== "public" && event.source) {
      lines.push(`CATEGORIES:${event.source}`);
    }
    
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

// Escape special characters for iCal
const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
};

// Generate CSV string
export const generateCSVString = (options: ExportOptions): string => {
  const { events, template } = options;
  
  const headers = template === "compact"
    ? ["Datum", "Uhrzeit", "Ort"]
    : template === "public"
      ? ["Datum", "Uhrzeit", "Ort", "Venue"]
      : ["Datum", "Uhrzeit", "Ort", "Venue", "Notizen", "Quelle"];
  
  const rows = events.map((event) => {
    const start = parseISO(event.start_time);
    const date = format(start, "dd.MM.yyyy", { locale: de });
    const time = format(start, "HH:mm", { locale: de });
    
    if (template === "compact") {
      return [date, time, event.location];
    } else if (template === "public") {
      return [date, time, event.location, event.venue_name || ""];
    } else {
      return [date, time, event.location, event.venue_name || "", event.note || "", event.source || ""];
    }
  });
  
  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map(escapeCSVField).join(";")),
  ].join("\n");
  
  return csvContent;
};

// Escape CSV fields
const escapeCSVField = (field: string): string => {
  if (field.includes(";") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

// Download file helper
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate PDF
export const generatePDF = async (options: ExportOptions): Promise<void> => {
  const { jsPDF } = await import("jspdf");
  const { events, template } = options;
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;
  
  // Header
  doc.setFillColor(139, 69, 19); // Brown color
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Pater Brown Tour", margin, 22);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Kalender Export • ${format(new Date(), "dd.MM.yyyy", { locale: de })}`, margin, 30);
  
  y = 50;
  
  // Stats summary
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`${events.length} Events • Template: ${template === "full" ? "Vollständig" : template === "compact" ? "Kompakt" : "Öffentlich"}`, margin, y);
  y += 15;
  
  // Events
  doc.setTextColor(0, 0, 0);
  
  events.forEach((event, index) => {
    // Check if we need a new page
    if (y > 260) {
      doc.addPage();
      y = margin;
    }
    
    const start = parseISO(event.start_time);
    
    // Date badge
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y - 4, 24, 18, 2, 2, "F");
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 69, 19);
    doc.text(format(start, "dd", { locale: de }), margin + 12, y + 4, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(format(start, "MMM", { locale: de }).toUpperCase(), margin + 12, y + 10, { align: "center" });
    
    // Event details
    const detailsX = margin + 30;
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(event.location, detailsX, y + 2);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    
    const timeText = format(start, "HH:mm", { locale: de }) + " Uhr";
    const venueText = event.venue_name ? ` • ${event.venue_name}` : "";
    doc.text(timeText + venueText, detailsX, y + 9);
    
    if (template === "full" && event.note) {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      const noteLines = doc.splitTextToSize(event.note, pageWidth - detailsX - margin);
      doc.text(noteLines.slice(0, 2), detailsX, y + 15);
      y += Math.min(noteLines.length, 2) * 4;
    }
    
    y += 22;
    
    // Separator line
    if (index < events.length - 1) {
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
    }
  });
  
  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Seite ${i} von ${pageCount} • Generiert am ${format(new Date(), "dd.MM.yyyy HH:mm", { locale: de })}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );
  }
  
  doc.save(options.filename || "pater-brown-kalender.pdf");
};

// Generate Google Calendar URL for a single event
export const getGoogleCalendarUrl = (event: ExportEvent): string => {
  const start = parseISO(event.start_time);
  const end = event.end_time ? parseISO(event.end_time) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  
  const formatGoogleDate = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    location: [event.venue_name, event.location].filter(Boolean).join(", "),
    details: event.note || "",
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
