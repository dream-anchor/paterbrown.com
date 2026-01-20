import { Calendar, Map, Plane, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "calendar", label: "Kalender", icon: Calendar },
  { id: "map", label: "Karte", icon: Map },
  { id: "travel", label: "Reisen", icon: Plane },
  { id: "upload", label: "Upload", icon: Upload },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass background */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/60 shadow-lg">
        {/* Safe area padding for iPhone */}
        <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 relative min-w-[64px]",
                  isActive 
                    ? "text-amber-600" 
                    : "text-gray-400 hover:text-gray-600"
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
