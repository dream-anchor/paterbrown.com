import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, RefreshCw, AlertTriangle, CheckCircle2, 
  XCircle, Clock, MapPin, ArrowRight, Wifi, WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface TrainStatus {
  delay_departure_minutes: number | null;
  delay_arrival_minutes: number | null;
  planned_platform: string | null;
  actual_platform: string | null;
  platform_changed: boolean;
  is_cancelled: boolean;
  next_stop: string | null;
  status_message: string;
  status_level: 'ok' | 'warning' | 'error';
  last_updated: string;
  train_found: boolean;
  connection_at_risk?: boolean;
  connection_warning?: string;
}

interface TrainLiveStatusProps {
  bookingId: string;
  originCity: string | null;
  destinationCity: string;
  trainNumber: string | null;
  departureDatetime: string;
  hasTransfer?: boolean;
}

export default function TrainLiveStatus({
  bookingId,
  originCity,
  destinationCity,
  trainNumber,
  departureDatetime,
  hasTransfer = false
}: TrainLiveStatusProps) {
  const [status, setStatus] = useState<TrainStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!originCity || !trainNumber) {
      setError('Keine Zugdaten verfügbar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('db-train-status', {
        body: {
          booking_id: bookingId,
          origin_city: originCity,
          train_number: trainNumber,
          departure_datetime: departureDatetime,
          is_departure: true
        }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        setError('Verbindungsfehler');
        return;
      }

      if (data?.status) {
        setStatus(data.status);
        setLastFetch(new Date());
      } else if (data?.error) {
        setError(data.error);
        if (data.status) {
          setStatus(data.status);
        }
      }
    } catch (err) {
      console.error('Error fetching train status:', err);
      setError('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, [bookingId, originCity, trainNumber, departureDatetime]);

  // Auto-fetch on mount if we have required data
  useEffect(() => {
    if (originCity && trainNumber) {
      fetchStatus();
    }
  }, [fetchStatus, originCity, trainNumber]);

  // Status display helpers
  const getStatusColor = () => {
    if (!status || !status.train_found) return 'bg-gray-100 border-gray-200';
    switch (status.status_level) {
      case 'ok': return 'bg-emerald-50 border-emerald-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    if (!status || !status.train_found) return <WifiOff className="w-5 h-5 text-gray-400" />;
    
    switch (status.status_level) {
      case 'ok': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Wifi className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusTextColor = () => {
    if (!status || !status.train_found) return 'text-gray-600';
    switch (status.status_level) {
      case 'ok': return 'text-emerald-700';
      case 'warning': return 'text-amber-700';
      case 'error': return 'text-red-700';
      default: return 'text-gray-600';
    }
  };

  // Don't render if no train number
  if (!trainNumber) {
    return null;
  }

  // Check if train departure is in the future (within next 24 hours) or recently passed
  const departureDate = parseISO(departureDatetime);
  const now = new Date();
  const hoursDiff = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Only show live status for trains departing within -2 to +12 hours
  if (hoursDiff < -2 || hoursDiff > 12) {
    return null;
  }

  return (
    <div className={`rounded-xl border ${getStatusColor()} p-4 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Live-Status
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="text-xs text-gray-400">
              {format(lastFetch, "HH:mm", { locale: de })} Uhr
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {error && !status && (
        <div className="text-sm text-gray-500">{error}</div>
      )}

      {status && (
        <div className="space-y-3">
          {/* Main Status */}
          <div className={`text-lg font-semibold ${getStatusTextColor()}`}>
            {status.is_cancelled ? (
              <span className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Zug fällt aus
              </span>
            ) : (
              status.status_message
            )}
          </div>

          {/* Delay Info */}
          {status.train_found && !status.is_cancelled && (
            <div className="grid grid-cols-2 gap-3">
              {/* Delay */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-500">Verspätung:</span>
                  <span className={`ml-1.5 font-medium ${
                    (status.delay_departure_minutes ?? 0) > 10 ? 'text-red-600' :
                    (status.delay_departure_minutes ?? 0) > 0 ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>
                    {status.delay_departure_minutes !== null 
                      ? (status.delay_departure_minutes > 0 ? `+${status.delay_departure_minutes} Min` : 'Pünktlich')
                      : '–'}
                  </span>
                </div>
              </div>

              {/* Platform */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-500">Gleis:</span>
                  {status.platform_changed ? (
                    <span className="ml-1.5 font-medium">
                      <span className="line-through text-gray-400">{status.planned_platform}</span>
                      <ArrowRight className="w-3 h-3 inline mx-1 text-amber-500" />
                      <span className="text-amber-600 font-bold">{status.actual_platform}</span>
                    </span>
                  ) : (
                    <span className="ml-1.5 font-medium text-gray-700">
                      {status.actual_platform || status.planned_platform || '–'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Platform Change Warning */}
          {status.platform_changed && !status.is_cancelled && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 border border-amber-300 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-sm font-medium text-amber-800">
                Gleiswechsel! Neues Gleis: {status.actual_platform}
              </span>
            </div>
          )}

          {/* Transfer Warning */}
          {hasTransfer && status.delay_departure_minutes && status.delay_departure_minutes > 5 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 border border-orange-300 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="text-sm font-medium text-orange-800">
                Umstieg könnte gefährdet sein! (+{status.delay_departure_minutes} Min Verspätung)
              </span>
            </div>
          )}

          {/* Not Found State */}
          {!status.train_found && (
            <div className="text-sm text-gray-500">
              Zug nicht im aktuellen Fahrplan gefunden. Status wird kurz vor Abfahrt verfügbar.
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && !status && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Lade Live-Status...
        </div>
      )}
    </div>
  );
}
