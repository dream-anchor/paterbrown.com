import { useMemo } from "react";
import { parseISO, isFuture, isThisYear, startOfMonth, differenceInDays } from "date-fns";
import { Plane, Hotel, Train, Euro, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TravelBooking {
  id: string;
  booking_type: "hotel" | "train" | "flight" | "bus" | "rental_car" | "other";
  start_datetime: string;
  end_datetime: string | null;
  origin_city: string | null;
  destination_city: string;
  details: Record<string, any>;
  status: "confirmed" | "changed" | "cancelled" | "pending" | "proposal";
}

interface TravelStatsProps {
  bookings: TravelBooking[];
}

// Estimated distances between major German cities (km)
const cityDistances: Record<string, Record<string, number>> = {
  "Berlin": { "München": 585, "Hamburg": 290, "Köln": 575, "Frankfurt": 545, "Stuttgart": 635, "Düsseldorf": 565, "Leipzig": 190, "Dresden": 195, "Hannover": 285, "Nürnberg": 440 },
  "München": { "Berlin": 585, "Hamburg": 790, "Köln": 575, "Frankfurt": 390, "Stuttgart": 230, "Düsseldorf": 610, "Leipzig": 430, "Dresden": 460, "Hannover": 640, "Nürnberg": 170 },
  "Hamburg": { "Berlin": 290, "München": 790, "Köln": 425, "Frankfurt": 490, "Stuttgart": 655, "Düsseldorf": 400, "Leipzig": 390, "Dresden": 475, "Hannover": 150, "Nürnberg": 590 },
  "Köln": { "Berlin": 575, "München": 575, "Hamburg": 425, "Frankfurt": 190, "Stuttgart": 370, "Düsseldorf": 40, "Leipzig": 500, "Dresden": 600, "Hannover": 290, "Nürnberg": 450 },
  "Frankfurt": { "Berlin": 545, "München": 390, "Hamburg": 490, "Köln": 190, "Stuttgart": 210, "Düsseldorf": 225, "Leipzig": 390, "Dresden": 460, "Hannover": 350, "Nürnberg": 225 },
  "Stuttgart": { "Berlin": 635, "München": 230, "Hamburg": 655, "Köln": 370, "Frankfurt": 210, "Düsseldorf": 405, "Leipzig": 490, "Dresden": 520, "Hannover": 510, "Nürnberg": 210 },
};

// Default distance if cities not found
const DEFAULT_DISTANCE = 350;

const estimateDistance = (origin: string | null, destination: string): number => {
  if (!origin) return DEFAULT_DISTANCE;
  
  // Normalize city names
  const normalizeCity = (city: string) => {
    const normalized = city.trim().toLowerCase();
    if (normalized.includes("berlin")) return "Berlin";
    if (normalized.includes("münchen") || normalized.includes("munich")) return "München";
    if (normalized.includes("hamburg")) return "Hamburg";
    if (normalized.includes("köln") || normalized.includes("cologne")) return "Köln";
    if (normalized.includes("frankfurt")) return "Frankfurt";
    if (normalized.includes("stuttgart")) return "Stuttgart";
    if (normalized.includes("düsseldorf")) return "Düsseldorf";
    if (normalized.includes("leipzig")) return "Leipzig";
    if (normalized.includes("dresden")) return "Dresden";
    if (normalized.includes("hannover")) return "Hannover";
    if (normalized.includes("nürnberg") || normalized.includes("nuremberg")) return "Nürnberg";
    return city;
  };
  
  const normOrigin = normalizeCity(origin);
  const normDest = normalizeCity(destination);
  
  return cityDistances[normOrigin]?.[normDest] || 
         cityDistances[normDest]?.[normOrigin] || 
         DEFAULT_DISTANCE;
};

export default function TravelStats({ bookings }: TravelStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    
    // Filter out cancelled bookings
    const activeBookings = bookings.filter(b => b.status !== "cancelled");
    
    // 1. Upcoming trips count
    const upcomingTrips = activeBookings.filter(b => isFuture(parseISO(b.start_datetime)));
    const upcomingCount = upcomingTrips.length;
    
    // Count trips added this month (for trend)
    const tripsAddedThisMonth = activeBookings.filter(b => {
      const created = parseISO(b.start_datetime);
      return created >= thisMonthStart && isFuture(created);
    }).length;
    
    // 2. Hotel nights
    const hotelBookings = activeBookings.filter(b => b.booking_type === "hotel");
    let totalNights = 0;
    let thisYearNights = 0;
    
    hotelBookings.forEach(booking => {
      if (booking.end_datetime) {
        const nights = Math.max(1, differenceInDays(
          parseISO(booking.end_datetime), 
          parseISO(booking.start_datetime)
        ));
        totalNights += nights;
        if (isThisYear(parseISO(booking.start_datetime))) {
          thisYearNights += nights;
        }
      } else {
        // Assume 1 night if no end date
        totalNights += 1;
        if (isThisYear(parseISO(booking.start_datetime))) {
          thisYearNights += 1;
        }
      }
    });
    
    // 3. Train kilometers
    const trainBookings = activeBookings.filter(b => b.booking_type === "train");
    let totalKm = 0;
    
    trainBookings.forEach(booking => {
      const distance = estimateDistance(booking.origin_city, booking.destination_city);
      totalKm += distance;
    });
    
    // 4. Travel expenses
    let totalExpenses = 0;
    let expenseCount = 0;
    
    activeBookings.forEach(booking => {
      const amount = booking.details?.total_amount || booking.details?.price;
      if (amount && typeof amount === "number") {
        totalExpenses += amount;
        expenseCount++;
      }
    });
    
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    
    return {
      upcomingCount,
      tripsAddedThisMonth,
      totalNights,
      thisYearNights,
      totalKm,
      trainCount: trainBookings.length,
      totalExpenses,
      averageExpense,
      hasExpenseData: expenseCount > 0,
    };
  }, [bookings]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-DE").format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("de-DE", { 
      style: "currency", 
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const statCards = [
    {
      title: "Anstehende Reisen",
      value: stats.upcomingCount,
      subtitle: stats.tripsAddedThisMonth > 0 
        ? `+${stats.tripsAddedThisMonth} diesen Monat`
        : "Keine neuen diesen Monat",
      icon: Plane,
      trend: stats.tripsAddedThisMonth > 0 ? "up" : "neutral",
      gradient: "from-violet-500 to-violet-600",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "Hotel-Nächte",
      value: stats.totalNights,
      subtitle: `${stats.thisYearNights} dieses Jahr`,
      icon: Hotel,
      trend: "neutral",
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Zug-Kilometer",
      value: `${formatNumber(stats.totalKm)} km`,
      subtitle: `${stats.trainCount} Fahrten`,
      icon: Train,
      trend: "neutral",
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      showSparkline: true,
    },
    {
      title: "Reise-Ausgaben",
      value: stats.hasExpenseData ? formatCurrency(stats.totalExpenses) : "–",
      subtitle: stats.hasExpenseData 
        ? `Ø ${formatCurrency(stats.averageExpense)} pro Buchung`
        : "Keine Preisdaten",
      icon: Euro,
      trend: "neutral",
      gradient: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-gray-400" />;
  };

  // Simple sparkline component
  const Sparkline = () => {
    const points = [20, 35, 25, 45, 30, 55, 40, 60, 50, 70];
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min;
    
    return (
      <svg className="w-16 h-8" viewBox="0 0 80 32">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-400"
          points={points.map((p, i) => 
            `${i * 8 + 4},${32 - ((p - min) / range) * 24 - 4}`
          ).join(" ")}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={card.title}
          className={cn(
            "relative overflow-hidden rounded-2xl p-4 bg-white border border-gray-100",
            "shadow-sm hover:shadow-md transition-all duration-300",
            "group"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Gradient accent line at top */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            card.gradient
          )} />
          
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              card.iconBg
            )}>
              <card.icon className={cn("w-5 h-5", card.iconColor)} />
            </div>
            
            {card.showSparkline ? (
              <Sparkline />
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendIcon trend={card.trend} />
              </div>
            )}
          </div>
          
          {/* Value */}
          <div className="text-2xl font-bold text-gray-900 tracking-tight">
            {typeof card.value === "number" ? formatNumber(card.value) : card.value}
          </div>
          
          {/* Title & Subtitle */}
          <div className="mt-1">
            <div className="text-sm font-medium text-gray-600">{card.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
