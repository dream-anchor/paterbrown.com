import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, Loader2, Train, Plane, Hotel, 
  Car, Bus, MapPin, Calendar, Clock, Building2, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types from the edge function response
export interface ReviewBookingData {
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
  details?: Record<string, any>;
  confidence: number;
  needs_review?: boolean;
  source_email_id?: string;
}

interface TravelReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingData: ReviewBookingData;
  onConfirm: () => void;
  onSkip: () => void;
}

const BOOKING_TYPE_ICONS: Record<string, React.ElementType> = {
  train: Train,
  flight: Plane,
  hotel: Hotel,
  rental_car: Car,
  bus: Bus,
  other: MapPin,
};

const BOOKING_TYPE_LABELS: Record<string, string> = {
  train: "Zugfahrt",
  flight: "Flug",
  hotel: "Hotel",
  rental_car: "Mietwagen",
  bus: "Bus",
  other: "Sonstiges",
};

export default function TravelReviewDialog({
  open,
  onOpenChange,
  bookingData,
  onConfirm,
  onSkip,
}: TravelReviewDialogProps) {
  const [formData, setFormData] = useState<ReviewBookingData>(bookingData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const Icon = BOOKING_TYPE_ICONS[formData.booking_type] || MapPin;

  const handleChange = (field: keyof ReviewBookingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // Insert the corrected booking into the database
      const { error } = await supabase
        .from("travel_bookings")
        .insert({
          booking_type: formData.booking_type,
          booking_number: formData.booking_number || null,
          provider: formData.provider || null,
          traveler_name: formData.traveler_name || null,
          traveler_names: formData.traveler_names || null,
          start_datetime: formData.start_datetime,
          end_datetime: formData.end_datetime || null,
          origin_city: formData.origin_city || null,
          destination_city: formData.destination_city,
          venue_name: formData.venue_name || null,
          venue_address: formData.venue_address || null,
          details: formData.details || null,
          ai_confidence: formData.confidence,
          needs_review: false, // User has reviewed it
          source_email_id: formData.source_email_id || null,
          status: "confirmed",
        });

      if (error) throw error;

      toast({
        title: "Buchung gespeichert",
        description: `${BOOKING_TYPE_LABELS[formData.booking_type]} nach ${formData.destination_city} wurde bestätigt.`,
      });

      onConfirm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving booking:", error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onOpenChange(false);
  };

  // Format datetime for input
  const formatDateTimeForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-[#1a1a1a] text-xl font-semibold">
                Unsichere Daten erkannt
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Konfidenz: {Math.round(bookingData.confidence * 100)}% – Bitte prüfen
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Type */}
          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              Buchungstyp
            </Label>
            <Select
              value={formData.booking_type}
              onValueChange={(value) => handleChange("booking_type", value)}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="train">🚂 Zugfahrt</SelectItem>
                <SelectItem value="flight">✈️ Flug</SelectItem>
                <SelectItem value="hotel">🏨 Hotel</SelectItem>
                <SelectItem value="rental_car">🚗 Mietwagen</SelectItem>
                <SelectItem value="bus">🚌 Bus</SelectItem>
                <SelectItem value="other">📍 Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Anbieter
            </Label>
            <Input
              value={formData.provider || ""}
              onChange={(e) => handleChange("provider", e.target.value)}
              placeholder="z.B. Deutsche Bahn, Lufthansa..."
              className="bg-white border-gray-200"
            />
          </div>

          {/* Traveler Name */}
          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Reisender
            </Label>
            <Input
              value={formData.traveler_name || ""}
              onChange={(e) => handleChange("traveler_name", e.target.value)}
              placeholder="Name des Reisenden"
              className="bg-white border-gray-200"
            />
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Start
              </Label>
              <Input
                value={formData.origin_city || ""}
                onChange={(e) => handleChange("origin_city", e.target.value)}
                placeholder="Abfahrtsort"
                className="bg-white border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ziel
              </Label>
              <Input
                value={formData.destination_city || ""}
                onChange={(e) => handleChange("destination_city", e.target.value)}
                placeholder="Ankunftsort"
                className="bg-white border-gray-200"
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Abfahrt
              </Label>
              <Input
                type="datetime-local"
                value={formatDateTimeForInput(formData.start_datetime)}
                onChange={(e) => handleChange("start_datetime", e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ankunft
              </Label>
              <Input
                type="datetime-local"
                value={formatDateTimeForInput(formData.end_datetime || "")}
                onChange={(e) => handleChange("end_datetime", e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
          </div>

          {/* Booking Number */}
          <div className="space-y-2">
            <Label className="text-gray-700">Buchungsnummer</Label>
            <Input
              value={formData.booking_number || ""}
              onChange={(e) => handleChange("booking_number", e.target.value)}
              placeholder="Buchungs- / Auftragsnummer"
              className="bg-white border-gray-200"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSaving}
            className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Überspringen
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSaving}
            className="rounded-full bg-[#1a1a1a] text-white hover:bg-gray-800 gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Speichere...
              </>
            ) : (
              "Bestätigen & Speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
