import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, ChevronDown } from "lucide-react";
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
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">PB</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              Pater Brown Admin
            </span>
          </Link>
          
          {/* User Dropdown Menu */}
          <div className="flex items-center">
            {userEmail ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-full 
                               bg-white/60 border border-gray-200/60 
                               hover:bg-white hover:border-amber-200 hover:shadow-sm
                               transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {/* Gradient Initial Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 
                                    flex items-center justify-center shadow-sm ring-2 ring-white">
                      <span className="text-[10px] font-bold text-white">
                        {getInitials(displayName)}
                      </span>
                    </div>
                    
                    {/* Name (Desktop) */}
                    <span className="hidden sm:block text-sm font-medium text-gray-900">
                      {displayName}
                    </span>
                    
                    {/* Chevron */}
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white border-gray-200 shadow-lg"
                >
                  {/* User Info Header */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                  
                  <DropdownMenuItem 
                    onClick={handleSettings}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
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
