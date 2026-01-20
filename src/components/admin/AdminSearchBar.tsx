import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, MapPin, Train, Plane, Hotel, Car, Theater, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SearchableItem {
  id: string;
  title: string;
  type: "tour" | "travel" | "calendar";
  location?: string;
  venueName?: string;
  provider?: string;
  bookingType?: string;
  date: Date;
  source?: string;
}

interface AdminSearchBarProps {
  items: SearchableItem[];
  onSelect: (item: SearchableItem) => void;
}

const AdminSearchBar = ({ items, onSelect }: AdminSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter and rank results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    
    const q = debouncedQuery.toLowerCase();
    
    return items
      .filter((item) => {
        const searchFields = [
          item.title,
          item.location,
          item.venueName,
          item.provider,
        ].filter(Boolean).map(s => s!.toLowerCase());
        
        return searchFields.some(field => field.includes(q));
      })
      .sort((a, b) => {
        // Prioritize exact matches in title
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aExact = aTitle.includes(q);
        const bExact = bTitle.includes(q);
        if (aExact && !bExact) return -1;
        if (bExact && !aExact) return 1;
        // Then by date (upcoming first)
        return a.date.getTime() - b.date.getTime();
      })
      .slice(0, 5);
  }, [debouncedQuery, items]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchableItem) => {
    onSelect(item);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <strong key={i} className="text-amber-600 font-semibold">{part}</strong> : part
    );
  };

  const getIcon = (item: SearchableItem) => {
    if (item.type === "travel") {
      switch (item.bookingType) {
        case "train": return Train;
        case "flight": return Plane;
        case "hotel": return Hotel;
        case "rental_car": return Car;
        default: return Train;
      }
    }
    if (item.type === "tour") return MapPin;
    if (item.type === "calendar") {
      return Theater;
    }
    return Calendar;
  };

  const getTypeLabel = (item: SearchableItem) => {
    if (item.type === "tour") {
      return item.source === "KL" ? "KL" : item.source === "KBA" ? "KBA" : "Tour";
    }
    if (item.type === "travel") {
      switch (item.bookingType) {
        case "train": return "Zug";
        case "flight": return "Flug";
        case "hotel": return "Hotel";
        case "rental_car": return "Mietwagen";
        default: return "Reise";
      }
    }
    return "Event";
  };

  const getTypeColor = (item: SearchableItem) => {
    if (item.type === "tour") {
      return item.source === "KL" ? "bg-yellow-500" : item.source === "KBA" ? "bg-emerald-500" : "bg-gray-500";
    }
    return "bg-blue-500";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Suche Events, Locations, Bookings..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-10 rounded-full border-gray-200 bg-white/80 backdrop-blur-sm
                     focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all
                     placeholder:text-gray-400 text-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                       hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && debouncedQuery.trim() && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100
                        overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((item, index) => {
                const Icon = getIcon(item);
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                      ${isSelected ? "bg-amber-50" : "hover:bg-gray-50"}`}
                  >
                    {/* Type Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${getTypeColor(item)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {highlightMatch(item.title, debouncedQuery)}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded text-white ${getTypeColor(item)}`}>
                          {getTypeLabel(item)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{formatDate(item.date)}</span>
                        {item.location && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {highlightMatch(item.location, debouncedQuery)}
                            </span>
                          </>
                        )}
                        {item.venueName && (
                          <>
                            <span>•</span>
                            <span className="truncate">
                              {highlightMatch(item.venueName, debouncedQuery)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Keyboard hint */}
                    {isSelected && (
                      <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">↵</kbd>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Keine Ergebnisse für "{debouncedQuery}"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Versuche einen anderen Suchbegriff
              </p>
            </div>
          )}
          
          {/* Footer hint */}
          {results.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span>{results.length} von {items.length} Ergebnissen</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white rounded border border-gray-200">↑</kbd>
                  <kbd className="px-1 py-0.5 bg-white rounded border border-gray-200">↓</kbd>
                  Navigieren
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white rounded border border-gray-200">↵</kbd>
                  Auswählen
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-white rounded border border-gray-200">Esc</kbd>
                  Schließen
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSearchBar;
