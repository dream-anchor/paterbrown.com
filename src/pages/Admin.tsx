import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import EventUploader from "@/components/admin/EventUploader";
import FullCalendar from "@/components/admin/FullCalendar";
import EventMap from "@/components/admin/EventMap";
import CalendarExport from "@/components/admin/CalendarExport";
import TravelDashboard from "@/components/admin/TravelDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Sparkles, Map, Plane } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get active tab from URL or default to "calendar"
  const activeTab = searchParams.get("tab") || "calendar";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Hide Osano cookie banner for admin users
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      if (window.Osano?.cm) {
        window.Osano.cm.hideDialog();
      }
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    // Listen for auth state changes (important for password recovery flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked the password reset link - they need to set a new password
          setIsPasswordRecovery(true);
          setIsAuthenticated(false);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' && isPasswordRecovery) {
          // Password was updated, user is now signed in
          setIsPasswordRecovery(false);
          setIsAuthenticated(true);
          setTimeout(() => {
            if (session?.user) {
              checkAdminRole(session.user.id);
            }
          }, 0);
        } else if (session) {
          setIsAuthenticated(true);
          // Defer role check to avoid Supabase deadlock
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        checkAdminRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isPasswordRecovery]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
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

  const handleLoginSuccess = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        checkAdminRole(session.user.id);
      }
    });
  };

  // Show password update form if user clicked reset link
  if (isPasswordRecovery) {
    return (
      <AdminLayout>
        <PasswordUpdateForm onSuccess={handleLoginSuccess} />
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <LoginForm onLogin={handleLoginSuccess} />
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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Premium Pill-Style Tabs - Reordered: Kalender → Karte → Reisen → Upload */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
          <TabsList className="inline-flex p-1 bg-white rounded-full shadow-sm border border-gray-200 gap-1">
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
              <span className="hidden sm:inline">Tour</span>
            </TabsTrigger>
            <TabsTrigger 
              value="travel" 
              className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
            >
              <Plane className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Reisen</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
            <FullCalendar 
              onNavigateToTravel={(bookingId) => {
                setSearchParams({ tab: "travel" });
              }}
              onNavigateToTour={(eventId) => {
                setSearchParams({ tab: "map", activeEventId: eventId });
              }}
            />
          </TabsContent>

          <TabsContent value="map" className="mt-0 focus-visible:outline-none">
            <EventMap 
              events={events} 
              onEventsUpdated={fetchEvents}
              initialActiveEventId={searchParams.get("activeEventId") || undefined}
            />
          </TabsContent>

          <TabsContent value="travel" className="mt-0 focus-visible:outline-none">
            <TravelDashboard />
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
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte gib deine E-Mail-Adresse ein",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (error) throw error;
      
      setResetSent(true);
      toast({
        title: "E-Mail gesendet",
        description: "Prüfe dein Postfach für den Reset-Link",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Reset-Link konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
            <span className="text-white text-xl">✓</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
            E-Mail gesendet
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Wir haben einen Passwort-Reset-Link an <strong>{email}</strong> gesendet.
          </p>
          <button
            onClick={() => {
              setIsResetMode(false);
              setResetSent(false);
            }}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            ← Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  if (isResetMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Passwort zurücksetzen
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gib deine E-Mail-Adresse ein
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  E-Mail
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-150"
                  placeholder="name@beispiel.de"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Senden...
                  </span>
                ) : (
                  "Reset-Link senden"
                )}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsResetMode(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Zurück zum Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsResetMode(true)}
              className="text-sm text-gray-500 hover:text-amber-600 transition-colors"
            >
              Passwort vergessen?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Password Update Form Component - For password recovery flow
const PasswordUpdateForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 6 Zeichen haben",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwörter stimmen nicht überein",
        description: "Bitte überprüfe deine Eingaben",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Passwort geändert",
        description: "Dein Passwort wurde erfolgreich aktualisiert",
      });
      
      onSuccess();
    } catch (error: any) {
      // Translate Supabase error messages to German
      let errorMessage = error.message || "Passwort konnte nicht geändert werden";
      
      if (error.message?.includes("same password") || error.message?.includes("different from the old")) {
        errorMessage = "Bitte wähle ein anderes Passwort. Dieses wurde bereits verwendet.";
      }
      
      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Neues Passwort setzen
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Wähle ein sicheres Passwort
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Neues Passwort
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-150"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Passwort bestätigen
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all duration-150"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Speichern...
                </span>
              ) : (
                "Passwort speichern"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
