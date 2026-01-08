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
  hotel: { icon: Hotel, label: "Hotel", color: "text-blue-600", bg: "bg-blue-50" },
  train: { icon: Train, label: "Zug", color: "text-green-600", bg: "bg-green-50" },
  flight: { icon: Plane, label: "Flug", color: "text-orange-600", bg: "bg-orange-50" },
  bus: { icon: Bus, label: "Bus", color: "text-purple-600", bg: "bg-purple-50" },
  rental_car: { icon: Car, label: "Mietwagen", color: "text-teal-600", bg: "bg-teal-50" },
  other: { icon: Package, label: "Sonstiges", color: "text-gray-600", bg: "bg-gray-50" },
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
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8 text-center">
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
      <div className={`bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden ${isMobile ? 'rounded-t-2xl rounded-b-none' : ''}`}>
        {/* Header - Apple-style gradient */}
        <div className="p-5 border-b border-gray-100/80 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${typeConfig.bg} flex items-center justify-center shadow-sm`}>
                <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                  {booking.venue_name || booking.destination_city}
                </h3>
                <p className="text-sm text-gray-500">{typeConfig.label}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full -mr-2 -mt-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[60vh] lg:max-h-none overflow-y-auto">
          {/* Booking Number & Status */}
          {booking.booking_number && (
            <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="font-mono font-medium text-gray-900">{booking.booking_number}</span>
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
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Zeitraum</span>
            </div>
            <div className="pl-6 text-sm">
              <div className="text-gray-600">
                {booking.booking_type === "hotel" ? "Check-in: " : "Abfahrt: "}
                <span className="font-medium text-gray-900">
                  {format(parseISO(booking.start_datetime), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                </span>
              </div>
              {booking.end_datetime && (
                <div className="mt-1.5 text-gray-600">
                  {booking.booking_type === "hotel" ? "Check-out: " : "Ankunft: "}
                  <span className="font-medium text-gray-900">
                    {format(parseISO(booking.end_datetime), "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-gray-100" />

          {/* Location */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ort</span>
            </div>
            <div className="pl-6 text-sm space-y-1">
              {booking.origin_city && (
                <div className="text-gray-600">Von: <span className="font-medium text-gray-900">{booking.origin_city}</span></div>
              )}
              <div className="text-gray-600">
                {booking.origin_city ? "Nach: " : ""}
                <span className="font-medium text-gray-900">{booking.destination_city}</span>
              </div>
              {booking.venue_address && (
                <div className="text-gray-500 mt-1">{booking.venue_address}</div>
              )}
            </div>
          </div>

          {/* Provider */}
          {booking.provider && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Anbieter</span>
                </div>
                <div className="pl-6 text-sm font-medium text-gray-900">{booking.provider}</div>
              </div>
            </>
          )}

          {/* Travelers */}
          {getTravelers().length > 0 && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reisende</span>
                </div>
                <div className="pl-6 space-y-1">
                  {getTravelers().map((name, i) => (
                    <div key={i} className="text-sm font-medium text-gray-900">{name}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Details */}
          {booking.details && Object.keys(booking.details).length > 0 && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details</span>
                </div>
                <div className="pl-6 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(booking.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-500 capitalize">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      <span className="font-medium text-gray-900">
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
              <Separator className="bg-gray-100" />
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dokumente</span>
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
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Original E-Mail anzeigen
                    </button>
                  )}
                  {attachments.map((att) => (
                    <button
                      key={att.id}
                      onClick={() => setViewingDocument(att)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
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
              <Separator className="bg-gray-100" />
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="flex items-center gap-2 text-sm w-full group"
                >
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
                    Versionen ({versions.length})
                  </span>
                  {showVersions ? (
                    <ChevronUp className="w-4 h-4 ml-auto text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
                  )}
                </button>
                {showVersions && (
                  <div className="pl-6 space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="text-sm border-l-2 border-gray-200 pl-3">
                        <div className="font-medium text-gray-900">
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
              <span>KI-Sicherheit: {Math.round(booking.ai_confidence * 100)}%</span>
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