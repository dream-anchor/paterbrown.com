import { useMemo, useRef } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MapPin, Calendar, Clock, Users, Navigation } from "lucide-react";

interface AdminEvent {
  id: string;
  title: string;
  location: string;
  state: string | null;
  venue_name: string | null;
  venue_url: string | null;
  start_time: string;
  end_time: string | null;
  note: string | null;
  source: "KL" | "KBA" | "unknown";
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface TourJourneyProps {
  events: AdminEvent[];
  onEventsUpdated?: () => void;
}

const TourJourney = ({ events }: TourJourneyProps) => {
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Sort events chronologically
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [events]);

  // Group events by Bundesland
  const eventsByState = useMemo(() => {
    const grouped = new Map<string, AdminEvent[]>();
    
    sortedEvents.forEach(event => {
      const state = event.state || "Unbekannt";
      if (!grouped.has(state)) {
        grouped.set(state, []);
      }
      grouped.get(state)!.push(event);
    });
    
    return grouped;
  }, [sortedEvents]);

  // Calculate tour year range
  const tourYearRange = useMemo(() => {
    if (sortedEvents.length === 0) return new Date().getFullYear().toString();
    
    const firstYear = new Date(sortedEvents[0].start_time).getFullYear();
    const lastYear = new Date(sortedEvents[sortedEvents.length - 1].start_time).getFullYear();
    
    if (firstYear === lastYear) return firstYear.toString();
    return `${firstYear}/${lastYear.toString().slice(-2)}`;
  }, [sortedEvents]);

  // Get global index for an event
  const getGlobalIndex = (event: AdminEvent): number => {
    return sortedEvents.findIndex(e => e.id === event.id) + 1;
  };

  // Scroll to a specific state section
  const scrollToState = (state: string) => {
    const element = sectionRefs.current.get(state);
    if (element) {
      const headerOffset = 180; // Account for sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Format date nicely
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEE, d. MMM yyyy", { locale: de });
  };

  // Format time
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: de });
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Navigation className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Keine Tour-Daten</h3>
        <p className="text-sm text-gray-500">Lade Events hoch, um die Tour-Übersicht zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header with Tour Statistics */}
      <div className="text-center mb-8 pb-8 border-b border-gray-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full mb-4">
          <Calendar className="w-3 h-3" />
          TOUR {tourYearRange}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
          Die Reise
        </h1>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{events.length} Stationen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{eventsByState.size} Bundesländer</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation - Sticky */}
      <div className="sticky top-16 z-20 -mx-4 px-4 py-4 bg-gray-50/95 backdrop-blur-md mb-8 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {Array.from(eventsByState.keys()).map(state => (
            <button 
              key={state}
              onClick={() => scrollToState(state)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 whitespace-nowrap hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Tour Stations by Bundesland */}
      <div className="space-y-12">
        {Array.from(eventsByState.entries()).map(([state, stateEvents]) => (
          <section 
            key={state} 
            ref={(el) => { if (el) sectionRefs.current.set(state, el); }}
            className="scroll-mt-48"
          >
            {/* State Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {state}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-l from-gray-300 to-transparent" />
            </div>
            
            {/* Events in this State */}
            <div className="space-y-4">
              {stateEvents.map((event) => {
                const globalIndex = getGlobalIndex(event);
                
                return (
                  <div 
                    key={event.id} 
                    className="flex gap-4 items-start group"
                  >
                    {/* Number Badge */}
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md group-hover:bg-amber-600 transition-colors">
                      {globalIndex}
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* City */}
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {event.location}
                          </h3>
                          
                          {/* Date & Time */}
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatEventDate(event.start_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatEventTime(event.start_time)} Uhr
                            </span>
                          </div>
                          
                          {/* Venue */}
                          {event.venue_name && (
                            <p className="text-sm text-gray-400 mt-1.5 truncate">
                              📍 {event.venue_name}
                            </p>
                          )}
                        </div>
                        
                        {/* Source Badge */}
                        <div className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                          event.source === 'KL' 
                            ? 'bg-blue-50 text-blue-600' 
                            : event.source === 'KBA'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-50 text-gray-500'
                        }`}>
                          {event.source}
                        </div>
                      </div>
                      
                      {/* Note if exists */}
                      {event.note && (
                        <p className="mt-3 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                          💡 {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-400">
          {events.length} Auftritte durch {eventsByState.size} Bundesländer
        </p>
      </div>
    </div>
  );
};

export default TourJourney;
