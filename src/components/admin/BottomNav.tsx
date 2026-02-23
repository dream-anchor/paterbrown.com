import { CalendarDays, MapPin, Plane, Heart, CloudDownload } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "calendar", label: "Plan", icon: CalendarDays },
  { id: "map", label: "Tour", icon: MapPin },
  { id: "travel", label: "Trips", icon: Plane },
  { id: "documents", label: "Drops", icon: CloudDownload },
  { id: "picks", label: "Picks", icon: Heart },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass background */}
      <div className="bg-background/80 backdrop-blur-xl border-t border-border/60 shadow-lg">
        {/* Safe area padding for iPhone notch + home indicator */}
        <div className="flex items-center justify-around px-2 pt-2 pb-2" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  haptics.tap();
                  onTabChange(item.id);
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-200 relative min-w-[52px] touch-target touch-feedback",
                  isActive
                    ? "text-amber-600"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}

                {/* Icon with glow effect when active */}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isActive && "bg-amber-100/80"
                )}>
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                  />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
