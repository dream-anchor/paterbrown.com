import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import {
  Hotel, Train, Plane, Bus, Car, Package,
  MapPin, Clock, Users, Hash, Building2, Phone,
  Mail, FileText, History, X, ExternalLink, Download,
  ChevronDown, ChevronUp, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DocumentViewer from "./DocumentViewer";

interface TravelBooking {
  id: string;
  trip_id: string | null;
  booking_type: "hotel" | "train" | "flight" | "bus" | "rental_car" | "other";
  booking_number: string | null;
  provider: string | null;
  traveler_name: string | null;
  traveler_names: string[] | null;
  start_datetime: string;
  end_datetime: string | null;
  origin_city: string | null;
  destination_city: string;
  venue_name: string | null;
  venue_address: string | null;
  details: Record<string, any>;
  status: "confirmed" | "changed" | "cancelled" | "pending";
  source_email_id: string | null;
  ai_confidence: number | null;
  created_at: string;
}

interface BookingVersion {
  id: string;
  version_number: number;
  previous_data: Record<string, any>;
  change_summary: string | null;
  changed_by: string;
  created_at: string;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  content_type: string | null;
}

interface Props {
  booking: TravelBooking | null;
  onClose: () => void;
  onUpdate: () => void;
  isMobile?: boolean;
}

const bookingTypeConfig = {
  hotel: { icon: Hotel, label: "Hotel", color: "text-blue-600" },
  train: { icon: Train, label: "Zug", color: "text-green-600" },
  flight: { icon: Plane, label: "Flug", color: "text-orange-600" },
  bus: { icon: Bus, label: "Bus", color: "text-purple-600" },
  rental_car: { icon: Car, label: "Mietwagen", color: "text-teal-600" },
  other: { icon: Package, label: "Sonstiges", color: "text-gray-600" },
};

export default function TravelBookingDetail({ booking, onClose, onUpdate, isMobile }: Props) {
  const [versions, setVersions] = useState<BookingVersion[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Attachment | null>(null);
  const [originalEmail, setOriginalEmail] = useState<{ subject: string; body_html: string } | null>(null);

  useEffect(() => {
    if (booking) {
      fetchVersions();
      fetchAttachments();
      fetchOriginalEmail();
    }
  }, [booking?.id]);

  const fetchVersions = async () => {
    if (!booking) return;
    const { data } = await supabase
      .from("booking_versions")
      .select("*")
      .eq("booking_id", booking.id)
      .order("version_number", { ascending: false });
    setVersions((data as BookingVersion[]) || []);
  };

  const fetchAttachments = async () => {
    if (!booking?.source_email_id) return;
    const { data } = await supabase
      .from("travel_attachments")
      .select("*")
      .eq("email_id", booking.source_email_id);
    setAttachments((data as Attachment[]) || []);
  };

  const fetchOriginalEmail = async () => {
    if (!booking?.source_email_id) return;
    const { data } = await supabase
      .from("travel_emails")
      .select("subject, body_html")
      .eq("id", booking.source_email_id)
      .single();
    setOriginalEmail(data);
  };

  if (!booking) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">
          Wähle eine Buchung aus, um Details anzuzeigen
        </p>
      </div>
    );
  }

  const typeConfig = bookingTypeConfig[booking.booking_type];
  const TypeIcon = typeConfig.icon;

  const getTravelers = () => {
    if (booking.traveler_names?.length) return booking.traveler_names;
    if (booking.traveler_name) return [booking.traveler_name];
    return [];
  };

  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${isMobile ? 'rounded-t-2xl' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center ${typeConfig.color}`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {booking.venue_name || booking.destination_city}
                </h3>
                <p className="text-sm text-gray-500">{typeConfig.label}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] lg:max-h-none overflow-y-auto">
          {/* Booking Number & Status */}
          {booking.booking_number && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="font-mono font-medium">{booking.booking_number}</span>
              </div>
              <Badge variant="outline" className={
                booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                booking.status === "changed" ? "bg-amber-50 text-amber-700 border-amber-200" :
                booking.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                "bg-gray-50 text-gray-600 border-gray-200"
              }>
                {booking.status === "confirmed" ? "Bestätigt" :
                 booking.status === "changed" ? "Geändert" :
                 booking.status === "cancelled" ? "Storniert" : "Ausstehend"}
              </Badge>
            </div>
          )}

          {/* Date & Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-gray-700">Zeitraum</span>
            </div>
            <div className="pl-6 text-sm">
              <div>
                {booking.booking_type === "hotel" ? "Check-in: " : "Abfahrt: "}
                <span className="font-medium">
                  {format(parseISO(booking.start_datetime), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                </span>
              </div>
              {booking.end_datetime && (
                <div className="mt-1">
                  {booking.booking_type === "hotel" ? "Check-out: " : "Ankunft: "}
                  <span className="font-medium">
                    {format(parseISO(booking.end_datetime), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-gray-700">Ort</span>
            </div>
            <div className="pl-6 text-sm space-y-1">
              {booking.origin_city && (
                <div>Von: <span className="font-medium">{booking.origin_city}</span></div>
              )}
              <div>
                {booking.origin_city ? "Nach: " : ""}
                <span className="font-medium">{booking.destination_city}</span>
              </div>
              {booking.venue_address && (
                <div className="text-gray-500">{booking.venue_address}</div>
              )}
            </div>
          </div>

          {/* Provider */}
          {booking.provider && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium text-gray-700">Anbieter</span>
                </div>
                <div className="pl-6 text-sm font-medium">{booking.provider}</div>
              </div>
            </>
          )}

          {/* Travelers */}
          {getTravelers().length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-gray-700">Reisende</span>
                </div>
                <div className="pl-6 space-y-1">
                  {getTravelers().map((name, i) => (
                    <div key={i} className="text-sm font-medium">{name}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Details */}
          {booking.details && Object.keys(booking.details).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium text-gray-700">Details</span>
                </div>
                <div className="pl-6 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(booking.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-500 capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      <span className="font-medium">
                        {typeof value === "boolean" ? (value ? "Ja" : "Nein") : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Documents */}
          {(attachments.length > 0 || originalEmail) && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium text-gray-700">Dokumente</span>
                </div>
                <div className="pl-6 space-y-2">
                  {originalEmail && (
                    <button
                      onClick={() => setViewingDocument({ 
                        id: "email", 
                        file_name: originalEmail.subject || "Original E-Mail",
                        file_path: "",
                        content_type: "text/html"
                      })}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      Original E-Mail anzeigen
                    </button>
                  )}
                  {attachments.map((att) => (
                    <button
                      key={att.id}
                      onClick={() => setViewingDocument(att)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      {att.file_name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full"
                >
                  <History className="w-4 h-4" />
                  <span className="font-medium text-gray-700">Versionen ({versions.length})</span>
                  {showVersions ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                </button>
                {showVersions && (
                  <div className="pl-6 space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="text-sm border-l-2 border-gray-200 pl-3">
                        <div className="font-medium text-gray-700">
                          Version {version.version_number}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {format(parseISO(version.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
                        </div>
                        {version.change_summary && (
                          <div className="mt-1 text-gray-600">{version.change_summary}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* AI Confidence */}
          {booking.ai_confidence !== null && (
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-400">
              <AlertCircle className="w-3 h-3" />
              KI-Sicherheit: {Math.round(booking.ai_confidence * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          attachment={viewingDocument}
          emailHtml={viewingDocument.id === "email" ? originalEmail?.body_html : undefined}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </>
  );
}
