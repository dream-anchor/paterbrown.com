import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import EventUploader from "@/components/admin/EventUploader";
import EventCalendar from "@/components/admin/EventCalendar";
import EventMap from "@/components/admin/EventMap";
import CalendarExport from "@/components/admin/CalendarExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Map, Upload, Download } from "lucide-react";
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
        <div className="animate-pulse text-amber-600 text-xl">Lädt...</div>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Kein Zugriff
          </h1>
          <p className="text-gray-600">
            Du hast keine Admin-Berechtigung.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm sticky top-16 z-30 shadow-sm border border-gray-200">
          <TabsTrigger value="upload" className="flex items-center gap-2 text-xs sm:text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Kalender</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2 text-xs sm:text-sm">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Karte</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2 text-xs sm:text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <EventUploader onEventsAdded={handleEventsAdded} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <EventCalendar events={events} onEventUpdate={fetchEvents} />
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <EventMap events={events} />
        </TabsContent>

        <TabsContent value="export" className="mt-0">
          <CalendarExport />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

// Login Form Component
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
