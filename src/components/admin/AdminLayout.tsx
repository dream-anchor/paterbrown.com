import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { toast } = useToast();
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
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors duration-150 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Zurück</span>
          </Link>
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">PB</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              Pater Brown Admin
            </span>
          </div>
          
          {/* Modern User Profile Pill */}
          <div className="flex items-center">
            {userEmail && (
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-full 
                           bg-white/60 border border-gray-200/60 
                           hover:bg-white hover:border-orange-200 hover:shadow-sm
                           transition-all duration-200"
                title="Abmelden"
              >
                {/* Gradient Initial Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 
                                flex items-center justify-center shadow-sm ring-2 ring-white">
                  <span className="text-[10px] font-bold text-white">
                    {getInitials(displayName)}
                  </span>
                </div>
                
                {/* Name + Email (Desktop) */}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900 leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-gray-500 leading-tight">
                    {userEmail}
                  </span>
                </div>
                
                {/* Logout Icon with Hover */}
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors ml-1" />
              </button>
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
