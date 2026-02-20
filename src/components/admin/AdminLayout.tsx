import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, ChevronDown, Bell, Check, AlertCircle, Info } from "lucide-react";
import troupeLogo from "@/assets/troupe-logo.webp";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications, AppNotification } from "@/contexts/NotificationContext";

const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `Vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Vor ${hours} Std`;
  return new Date(timestamp).toLocaleDateString("de-DE", { day: "numeric", month: "short" });
};

const NotifIcon = ({ type }: { type: AppNotification["type"] }) => {
  if (type === "success") return <Check className="w-3 h-3 text-green-600" />;
  if (type === "error") return <AlertCircle className="w-3 h-3 text-red-600" />;
  return <Info className="w-3 h-3 text-gray-500" />;
};

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet",
    });
    window.location.reload();
  };

  const handleSettings = () => {
    navigate("/admin?tab=settings");
  };

  // Get display name from email (before @)
  const displayName = userEmail?.split("@")[0] || "Admin";

  // Get initials from display name
  const getInitials = (name: string) => {
    const parts = name.split(/[.\-_\s]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 admin-no-focus-ring" style={{ color: '#111827' }}>
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Empty left spacer for balance */}
          <div className="w-24" />
          
          {/* Logo / Title - Clickable */}
          <Link 
            to="/admin"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src={troupeLogo} 
              alt="Troupe" 
              className="h-8 w-auto"
            />
          </Link>
          
          {/* Right actions: Bell + User */}
          <div className="flex items-center gap-2">

            {/* Notification Bell */}
            <Popover onOpenChange={(open) => { if (open) markAllRead(); }}>
              <PopoverTrigger asChild>
                <button
                  className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200/80 hover:border-gray-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  aria-label="Aktivitäten"
                >
                  <Bell className="w-4 h-4 text-gray-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-80 p-0 rounded-2xl shadow-xl border border-gray-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Aktivitäten</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Alle löschen
                    </button>
                  )}
                </div>
                {/* List */}
                <ScrollArea className="max-h-80">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">Keine Aktivitäten</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3",
                            !n.read && "bg-amber-50/60"
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                              n.type === "success" ? "bg-green-100" : n.type === "error" ? "bg-red-100" : "bg-gray-100"
                            )}
                          >
                            <NotifIcon type={n.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                            {n.detail && <p className="text-xs text-gray-500 mt-0.5">{n.detail}</p>}
                            <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {userEmail ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="group flex items-center gap-2 px-1.5 py-1.5 rounded-full 
                               bg-white border border-gray-200/80 
                               hover:border-gray-300 hover:shadow-md
                               transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {/* Gradient Initial Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 
                                    flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white">
                        {getInitials(displayName)}
                      </span>
                    </div>
                    
                    {/* Chevron */}
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors mr-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={8}
                  className="w-64 p-2 bg-white border border-gray-200 shadow-xl rounded-2xl"
                >
                  {/* User Info Header */}
                  <div className="px-3 py-3 mb-1 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 
                                      flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-white">
                          {getInitials(displayName)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuItem 
                    onClick={handleSettings}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Einstellungen</span>
                      <p className="text-xs text-gray-500">Profil & Papierkorb</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-2 bg-gray-100" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm font-medium">Abmelden</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="w-24" /> 
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
