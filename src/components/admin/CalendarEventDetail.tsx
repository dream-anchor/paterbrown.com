import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Trash2,
  ExternalLink,
  Train,
  Plane,
  Hotel,
  QrCode,
  FileText,
  Map,
  Phone,
  Globe,
  Mail,
  Building2,
  Pencil,
} from "lucide-react";
import type { CalendarEntry } from "./FullCalendar";
import EventEditModal, { type UniversalEvent } from "./EventEditModal";

interface CalendarEventDetailProps {
  event: CalendarEntry | null;
  onClose: () => void;
  onDelete: () => void;
  onNavigateToTravel?: (bookingId: string) => void;
  onNavigateToTour?: (eventId: string) => void;
}

const CalendarEventDetail = ({
  event,
  onClose,
  onDelete,
  onNavigateToTravel,
  onNavigateToTour,
}: CalendarEventDetailProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  // Convert CalendarEntry to UniversalEvent for editing
  const convertToUniversalEvent = (entry: CalendarEntry): UniversalEvent => {
    let source: "calendar_events" | "admin_events" | "travel_bookings" = "calendar_events";
    if (entry.category === "tour") source = "admin_events";
    else if (entry.category === "travel") source = "travel_bookings";
    
    return {
      id: entry.id,
      title: entry.title,
      start: entry.start,
      end: entry.end,
      allDay: entry.allDay,
      location: entry.location,
      description: entry.metadata?.description,
      category: entry.type,
      source,
      metadata: {
        ...entry.metadata,
        tour_source: entry.metadata?.source,
        event_status: entry.metadata?.event_status || "confirmed",
      },
    };
  };

  if (!event) return null;

  const handleDelete = async () => {
    if (!confirm("Diesen Termin wirklich löschen?")) return;

    setIsDeleting(true);
    try {
      let error = null;
      
      if (event.category === "travel") {
        const result = await supabase.from("travel_bookings").delete().eq("id", event.id);
        error = result.error;
      } else if (event.category === "tour") {
        const result = await supabase.from("admin_events").delete().eq("id", event.id);
        error = result.error;
      } else {
        const result = await supabase.from("calendar_events").delete().eq("id", event.id);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Gelöscht",
        description: "Termin wurde gelöscht",
      });

      onDelete();
      onClose();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht gelöscht werden",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    });
  };

  const Icon = event.icon;
  const isTravel = event.category === "travel";
  const isTour = event.category === "tour";
  const isManual = event.category === "manual";

  // Get booking type icon for travel
  const getBookingTypeIcon = () => {
    switch (event.metadata?.booking_type) {
      case "train": return Train;
      case "flight": return Plane;
      case "hotel": return Hotel;
      default: return Icon;
    }
  };

  const BookingIcon = getBookingTypeIcon();

  return (
    <>
      <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${event.color} flex items-center justify-center flex-shrink-0`}>
                <BookingIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 pr-8">
                  {event.title}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">{formatDate(event.start)}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Time */}
            {!event.allDay && (
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>
                  {formatTime(event.start)}
                  {event.end && ` – ${formatTime(event.end)}`}
                </span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{event.location}</span>
              </div>
            )}

            {/* Status Badge if optioniert */}
            {event.metadata?.event_status === "optioniert" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Optioniert</span>
              </div>
            )}

            {event.metadata?.event_status === "cancelled" && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Abgesagt</span>
              </div>
            )}

            {/* Travel-specific details */}
            {isTravel && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Buchungsdetails</h4>
                
                {event.metadata?.booking_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Buchungsnummer</span>
                    <span className="font-mono text-gray-900">{event.metadata.booking_number}</span>
                  </div>
                )}
                
                {event.metadata?.provider && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Anbieter</span>
                    <span className="text-gray-900">{event.metadata.provider}</span>
                  </div>
                )}
                
                {event.metadata?.origin_city && event.metadata?.destination_city && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Strecke</span>
                    <span className="text-gray-900">
                      {event.metadata.origin_city} → {event.metadata.destination_city}
                    </span>
                  </div>
                )}
                
                {event.metadata?.venue_name && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Hotel</span>
                    <span className="text-gray-900">{event.metadata.venue_name}</span>
                  </div>
                )}

                {/* QR Code if available */}
                {event.metadata?.qr_code_url && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <QrCode className="w-4 h-4" />
                      <span>Ticket QR-Code</span>
                    </div>
                    <img
                      src={event.metadata.qr_code_url}
                      alt="QR-Code"
                      className="w-32 h-32 object-contain bg-white border border-gray-200 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tour-specific details */}
            {isTour && event.metadata && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm">Tour-Details</h4>
                  {event.tourIndex && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                      ${event.metadata.source === "KL" ? "bg-yellow-500 text-yellow-900" : 
                        event.metadata.source === "KBA" ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                      Station {event.tourIndex}
                    </span>
                  )}
                </div>
                
                {event.metadata.venue_name && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Venue</span>
                    <span className="text-gray-900">{event.metadata.venue_name}</span>
                  </div>
                )}

                {/* Venue Address */}
                {event.metadata.venue_address && (
                  <div className="flex items-start gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-700">{event.metadata.venue_address}</span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.metadata.venue_address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Auf Karte anzeigen
                      </a>
                    </div>
                  </div>
                )}

                {/* Venue Phone */}
                {event.metadata.venue_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a 
                      href={`tel:${event.metadata.venue_phone}`}
                      className="text-gray-700 hover:text-amber-600"
                    >
                      {event.metadata.venue_phone}
                    </a>
                  </div>
                )}

                {/* Venue Website */}
                {event.metadata.venue_url && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a 
                      href={event.metadata.venue_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      Website besuchen
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Venue Email */}
                {event.metadata.venue_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a 
                      href={`mailto:${event.metadata.venue_email}`}
                      className="text-gray-700 hover:text-amber-600"
                    >
                      {event.metadata.venue_email}
                    </a>
                  </div>
                )}
                
                {event.metadata.source && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-500">Quelle</span>
                    <span className={`font-medium ${
                      event.metadata.source === "KL" ? "text-yellow-600" : 
                      event.metadata.source === "KBA" ? "text-emerald-600" : "text-gray-600"
                    }`}>
                      {event.metadata.source === "KL" ? "Konzertdirektion Landgraf" :
                       event.metadata.source === "KBA" ? "Konzertbüro Augsburg" : "Unbekannt"}
                    </span>
                  </div>
                )}
                
                {event.metadata.description && (
                  <div className="text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-500 block mb-1">Notiz</span>
                    <span className="text-gray-700 italic">{event.metadata.description}</span>
                  </div>
                )}
              </div>
            )}

            {/* Manual event description */}
            {isManual && event.metadata?.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Notiz</span>
                </div>
                <p className="text-gray-700 text-sm">{event.metadata.description}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-0"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isDeleting ? "Löschen..." : "Löschen"}
            </Button>

            {/* Edit Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowEditModal(true)}
              className="border-gray-200 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Bearbeiten
            </Button>
            
            {isTour && onNavigateToTour && (
              <Button variant="outline" size="sm" onClick={() => onNavigateToTour(event.id)} className="border-gray-200 hover:bg-gray-50">
                <Map className="w-4 h-4 mr-1" />
                Auf Karte zeigen
              </Button>
            )}
            {isTravel && onNavigateToTravel && (
              <Button variant="outline" size="sm" onClick={() => onNavigateToTravel(event.id)} className="border-gray-200 hover:bg-gray-50">
                <ExternalLink className="w-4 h-4 mr-1" />
                In Reisen öffnen
              </Button>
            )}
            
            <div className="flex-1" />
            
            <Button variant="apple" size="sm" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal - rendered outside main dialog */}
      <EventEditModal
        event={convertToUniversalEvent(event)}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={() => {
          setShowEditModal(false);
          onDelete(); // Trigger refresh
          onClose();
        }}
        onDelete={() => {
          setShowEditModal(false);
          onDelete();
          onClose();
        }}
      />
    </>
  );
};

export default CalendarEventDetail;