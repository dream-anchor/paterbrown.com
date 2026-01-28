import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, ChevronDown } from "lucide-react";
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

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
          
          {/* User Dropdown Menu - Premium Design */}
          <div className="flex items-center">
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
