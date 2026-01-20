import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Check,
  Search,
} from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CalendarEntry } from "./FullCalendar";

export interface FilterState {
  dateRange: "all" | "today" | "week" | "month" | "next30" | "custom";
  customStart?: Date;
  customEnd?: Date;
  status: "all" | "upcoming" | "past";
  cities: string[];
  source: "all" | "KL" | "KBA";
}

interface EventFilterPanelProps {
  entries: CalendarEntry[];
  onFilterChange: (filtered: CalendarEntry[]) => void;
  totalCount: number;
  filteredCount: number;
}

const EventFilterPanel = ({
  entries,
  onFilterChange,
  totalCount,
  filteredCount,
}: EventFilterPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  // Initialize filter state from URL params
  const [filters, setFilters] = useState<FilterState>(() => ({
    dateRange: (searchParams.get("dateRange") as FilterState["dateRange"]) || "all",
    customStart: searchParams.get("customStart") ? new Date(searchParams.get("customStart")!) : undefined,
    customEnd: searchParams.get("customEnd") ? new Date(searchParams.get("customEnd")!) : undefined,
    status: (searchParams.get("status") as FilterState["status"]) || "all",
    cities: searchParams.get("cities")?.split(",").filter(Boolean) || [],
    source: (searchParams.get("source") as FilterState["source"]) || "all",
  }));

  // Extract unique cities from entries
  const allCities = useMemo(() => {
    const cities = new Set<string>();
    entries.forEach((entry) => {
      if (entry.location) {
        // Extract city name (before any parentheses or commas)
        const city = entry.location.split(/[,(]/)[0].trim();
        if (city) cities.add(city);
      }
      if (entry.metadata?.destination_city) {
        cities.add(entry.metadata.destination_city);
      }
    });
    return Array.from(cities).sort();
  }, [entries]);

  // Filter cities by search
  const filteredCities = useMemo(() => {
    if (!citySearch) return allCities;
    return allCities.filter((city) =>
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [allCities, citySearch]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.cities.length > 0) count++;
    if (filters.source !== "all") count++;
    return count;
  }, [filters]);

  // Update URL params when filters change
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    
    if (updated.dateRange !== "all") {
      params.set("dateRange", updated.dateRange);
    } else {
      params.delete("dateRange");
    }
    
    if (updated.customStart) {
      params.set("customStart", updated.customStart.toISOString());
    } else {
      params.delete("customStart");
    }
    
    if (updated.customEnd) {
      params.set("customEnd", updated.customEnd.toISOString());
    } else {
      params.delete("customEnd");
    }
    
    if (updated.status !== "all") {
      params.set("status", updated.status);
    } else {
      params.delete("status");
    }
    
    if (updated.cities.length > 0) {
      params.set("cities", updated.cities.join(","));
    } else {
      params.delete("cities");
    }
    
    if (updated.source !== "all") {
      params.set("source", updated.source);
    } else {
      params.delete("source");
    }

    setSearchParams(params, { replace: true });
  };

  // Apply filters to entries
  const applyFilters = () => {
    let filtered = [...entries];
    const now = new Date();

    // Date filter
    if (filters.dateRange !== "all") {
      let start: Date | undefined;
      let end: Date | undefined;

      switch (filters.dateRange) {
        case "today":
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case "week":
          start = startOfWeek(now, { weekStartsOn: 1 });
          end = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case "month":
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case "next30":
          start = startOfDay(now);
          end = endOfDay(addDays(now, 30));
          break;
        case "custom":
          start = filters.customStart ? startOfDay(filters.customStart) : undefined;
          end = filters.customEnd ? endOfDay(filters.customEnd) : undefined;
          break;
      }

      if (start) {
        filtered = filtered.filter((e) => e.start >= start!);
      }
      if (end) {
        filtered = filtered.filter((e) => e.start <= end!);
      }
    }

    // Status filter
    if (filters.status === "upcoming") {
      filtered = filtered.filter((e) => e.start >= now);
    } else if (filters.status === "past") {
      filtered = filtered.filter((e) => e.start < now);
    }

    // City filter
    if (filters.cities.length > 0) {
      filtered = filtered.filter((e) => {
        const location = e.location?.split(/[,(]/)[0].trim() || "";
        const destination = e.metadata?.destination_city || "";
        return filters.cities.some(
          (city) =>
            location.toLowerCase().includes(city.toLowerCase()) ||
            destination.toLowerCase().includes(city.toLowerCase())
        );
      });
    }

    // Source filter
    if (filters.source !== "all") {
      filtered = filtered.filter((e) => e.metadata?.source === filters.source);
    }

    onFilterChange(filtered);
  };

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, entries]);

  // Clear all filters
  const clearAllFilters = () => {
    updateFilters({
      dateRange: "all",
      customStart: undefined,
      customEnd: undefined,
      status: "all",
      cities: [],
      source: "all",
    });
  };

  // Toggle city selection
  const toggleCity = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter((c) => c !== city)
      : [...filters.cities, city];
    updateFilters({ cities: newCities });
  };

  const dateRangeOptions = [
    { value: "all", label: "Alle Zeiten" },
    { value: "today", label: "Heute" },
    { value: "week", label: "Diese Woche" },
    { value: "month", label: "Dieser Monat" },
    { value: "next30", label: "Nächste 30 Tage" },
    { value: "custom", label: "Zeitraum wählen..." },
  ];

  const statusOptions = [
    { value: "all", label: "Alle" },
    { value: "upcoming", label: "Kommende" },
    { value: "past", label: "Vergangene" },
  ];

  const sourceOptions = [
    { value: "all", label: "Alle Sources" },
    { value: "KL", label: "Konzertdirektion Landgraf (KL)" },
    { value: "KBA", label: "Konzertdirektion Augsburg (KBA)" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">Filter</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              {activeFilterCount} aktiv
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Zeige {filteredCount} von {totalCount} Events
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Filter Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Zeitraum
                </label>
                <div className="space-y-1">
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (option.value === "custom") {
                          updateFilters({ dateRange: "custom" });
                        } else {
                          updateFilters({ 
                            dateRange: option.value as FilterState["dateRange"],
                            customStart: undefined,
                            customEnd: undefined,
                          });
                        }
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors",
                        filters.dateRange === option.value
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Date Range Picker */}
                {filters.dateRange === "custom" && (
                  <div className="mt-2 flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 justify-start text-left font-normal">
                          <Calendar className="mr-2 h-3 w-3" />
                          {filters.customStart
                            ? format(filters.customStart, "dd.MM.yy", { locale: de })
                            : "Von"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.customStart}
                          onSelect={(date) => updateFilters({ customStart: date })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 justify-start text-left font-normal">
                          <Calendar className="mr-2 h-3 w-3" />
                          {filters.customEnd
                            ? format(filters.customEnd, "dd.MM.yy", { locale: de })
                            : "Bis"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.customEnd}
                          onSelect={(date) => updateFilters({ customEnd: date })}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Status
                </label>
                <div className="space-y-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateFilters({ status: option.value as FilterState["status"] })
                      }
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors",
                        filters.status === option.value
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Source
                </label>
                <div className="space-y-1">
                  {sourceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateFilters({ source: option.value as FilterState["source"] })
                      }
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2",
                        filters.source === option.value
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {option.value === "KL" && (
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      )}
                      {option.value === "KBA" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Stadt/Ort ({filters.cities.length} ausgewählt)
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Suchen..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-0.5 pr-1">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2",
                        filters.cities.includes(city)
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          filters.cities.includes(city)
                            ? "bg-amber-500 border-amber-500"
                            : "border-gray-300"
                        )}
                      >
                        {filters.cities.includes(city) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {city}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">
                      Keine Städte gefunden
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Clear All Button */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Alle Filter zurücksetzen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilterPanel;
