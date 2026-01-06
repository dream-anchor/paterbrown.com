import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import EventUploader from "@/components/admin/EventUploader";
import EventCalendar from "@/components/admin/EventCalendar";

import EventMap from "@/components/admin/EventMap";
import CalendarExport from "@/components/admin/CalendarExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Upload, Share2, Sparkles, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminEvent {
  id: string;
  title: string;
  location: string;
  state: string | null;
  venue_name: string | null;
  venue_url: string | null;
  start_time: string;
  end_time: string | null;
  note: string | null;
  source: "KL" | "KBA" | "unknown";
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Hide Osano cookie banner for admin users
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      if (window.Osano?.cm) {
        window.Osano.cm.hideDialog();
      }
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) {
        console.error("Error checking role:", roleError);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!roleData);
      }

      if (roleData) {
        await fetchEvents();
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Fehler",
        description: "Events konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleEventsAdded = () => {
    fetchEvents();
    toast({
      title: "Erfolg",
      description: "Events wurden hinzugefügt",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Lädt...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <LoginForm onLogin={checkAuth} />
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Kein Zugriff
          </h1>
          <p className="text-sm text-gray-500 max-w-sm">
            Du hast keine Admin-Berechtigung für diesen Bereich.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Tabs defaultValue="calendar" className="w-full">
        {/* Premium Pill-Style Tabs */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
          <TabsList className="inline-flex p-1 bg-white rounded-full shadow-sm border border-gray-200 gap-1">
            <TabsTrigger 
              value="upload" 
              className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Kalender</span>
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
            >
              <Map className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Karte</span>
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
            >
              <Share2 className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Teilen</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="upload" className="mt-0 focus-visible:outline-none">
            <EventUploader onEventsAdded={handleEventsAdded} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
            <EventCalendar events={events} onEventUpdate={fetchEvents} />
          </TabsContent>


          <TabsContent value="map" className="mt-0 focus-visible:outline-none">
            <EventMap events={events} onEventsUpdated={fetchEvents} />
          </TabsContent>

          <TabsContent value="export" className="mt-0 focus-visible:outline-none">
            <CalendarExport />
          </TabsContent>
        </div>
      </Tabs>
    </AdminLayout>
  );
};

// Login Form Component - Premium Design
const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onLogin();
    } catch (error: any) {
      toast({
        title: "Login fehlgeschlagen",
        description: error.message || "Bitte überprüfe deine Eingaben",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Melde dich an, um fortzufahren
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-150"
                placeholder="name@beispiel.de"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-150"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Anmelden...
                </span>
              ) : (
                "Anmelden"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
