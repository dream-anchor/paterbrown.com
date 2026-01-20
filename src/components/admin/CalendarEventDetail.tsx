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
} from "lucide-react";
import type { CalendarEntry } from "./FullCalendar";

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
  const { toast } = useToast();

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
              
              {event.metadata.source && (
                <div className="flex items-center justify-between text-sm">
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
                <div className="text-sm">
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
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? "Löschen..." : "Löschen"}
          </Button>

          <div className="flex gap-2">
            {isTour && onNavigateToTour && (
              <Button variant="apple" size="sm" onClick={() => onNavigateToTour(event.id)}>
                <Map className="w-4 h-4 mr-1" />
                Auf Karte zeigen
              </Button>
            )}
            {isTravel && onNavigateToTravel && (
              <Button variant="apple" size="sm" onClick={() => onNavigateToTravel(event.id)}>
                <ExternalLink className="w-4 h-4 mr-1" />
                In Reisen öffnen
              </Button>
            )}
            <Button variant="apple" size="sm" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventDetail;
