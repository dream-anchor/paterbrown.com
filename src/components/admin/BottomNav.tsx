import { Calendar, Map, Plane, Heart, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainNavItems = [
  { id: "calendar", label: "Kalender", icon: Calendar },
  { id: "map", label: "Karte", icon: Map },
  { id: "travel", label: "Reisen", icon: Plane },
  { id: "picks", label: "Picks", icon: Heart },
];

const moreItems = [
  { id: "documents", label: "Dokumente" },
  { id: "settings", label: "Einstellungen" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = moreItems.some(item => item.id === activeTab);
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass background */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/60 shadow-lg">
        {/* Safe area padding for iPhone */}
        <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 relative min-w-[56px]",
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

          {/* More Menu */}
          <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 relative min-w-[56px]",
                  isMoreActive 
                    ? "text-amber-600" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {isMoreActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isMoreActive && "bg-amber-100/80"
                )}>
                  <MoreHorizontal className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isMoreActive && "scale-110"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isMoreActive ? "opacity-100" : "opacity-70"
                )}>
                  Mehr
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white mb-2">
              {moreItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMoreOpen(false);
                  }}
                  className={cn(
                    activeTab === item.id && "bg-amber-50 text-amber-700"
                  )}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
