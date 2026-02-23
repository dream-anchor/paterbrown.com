import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import BottomNav from "@/components/admin/BottomNav";
import AdminCommandPalette from "@/components/admin/AdminCommandPalette";
import AdminSearchBar from "@/components/admin/AdminSearchBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Plane, CloudDownload, Heart, Sparkles, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Lazy-load heavy tab components — only loaded when the tab is first visited
const FullCalendar = lazy(() => import("@/components/admin/FullCalendar"));
const EventMap = lazy(() => import("@/components/admin/EventMap"));
const VvkApprovalPanel = lazy(() => import("@/components/admin/VvkApprovalPanel"));
const TravelDashboard = lazy(() => import("@/components/admin/TravelDashboard"));
const DocumentsPanel = lazy(() => import("@/components/admin/DocumentsPanel"));
const PicksPanel = lazy(() => import("@/components/admin/PicksPanel"));
const SettingsPanel = lazy(() => import("@/components/admin/SettingsPanel"));

const TabFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

interface AdminEvent {
  id: string;
  title: string;
  location: string;
  state: string | null;
  venue_name: string | null;
  venue_url: string | null;
  ticket_url: string | null;
  ticket_url_approved: boolean;
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
  const [travelBookings, setTravelBookings] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedSearchEvent, setSelectedSearchEvent] = useState<any>(null);
  // Map sub-tab derived from URL for deep-linking
  const mapSubTab = (searchParams.get("subtab") === "vvk" ? "vvk" : "karte") as "karte" | "vvk";
  const navigate = useNavigate();
  const { toast } = useToast();

  // Command Palette keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get active tab from URL or default to "calendar"
  const activeTab = searchParams.get("tab") || "calendar";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Mark admin route on <body> so CSS can target cookie widgets reliably
  useEffect(() => {
    document.body.classList.add("admin-area");
    return () => {
      document.body.classList.remove("admin-area");
      document.body.classList.remove("admin-authenticated");
    };
  }, []);

  const hideOsanoUi = useCallback(() => {
    // 1) Best-effort API call (may not be ready due to async script loading)
    try {
      window.Osano?.cm?.hideDialog?.();
    } catch {
      // ignore
    }

    // 2) Hard hide known DOM nodes (widget bubble + dialog)
    const selectors = [
      ".osano-cm-dialog",
      ".osano-cm-window",
      ".osano-cm-widget",
      "#osano-cm-dialog",
      "#osano-cm-window",
      "#osano-cm-widget",
    ];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
        (el as HTMLElement).style.setProperty("visibility", "hidden", "important");
        (el as HTMLElement).style.setProperty("pointer-events", "none", "important");
      });
    }
  }, []);

  // Hide Osano cookie UI for authenticated users (including late script init)
  useEffect(() => {
    if (!isAuthenticated) {
      document.body.classList.remove("admin-authenticated");
      return;
    }

    document.body.classList.add("admin-authenticated");
    hideOsanoUi();

    // Osano script is async; observe DOM for late inserts and hide again.
    const observer = new MutationObserver(() => hideOsanoUi());
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 15000);

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      document.body.classList.remove("admin-authenticated");
    };
  }, [isAuthenticated, hideOsanoUi]);

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
      const [eventsRes, bookingsRes, calEventsRes] = await Promise.all([
        supabase.from("admin_events").select("*").is("deleted_at", null).order("start_time", { ascending: true }),
        supabase.from("travel_bookings").select("*").is("deleted_at", null).order("start_datetime"),
        supabase.from("calendar_events").select("*").is("deleted_at", null).order("start_datetime"),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (calEventsRes.error) throw calEventsRes.error;
      
      setEvents(eventsRes.data || []);
      setTravelBookings(bookingsRes.data || []);
      setCalendarEvents(calEventsRes.data || []);
      setDataVersion(v => v + 1);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  // Combine all data for search
  const searchableItems = useMemo(() => {
    const items: any[] = [];
    
    // Admin events (tour dates)
    events.forEach((event, index) => {
      items.push({
        id: event.id,
        title: `#${index + 1} ${event.location}`,
        type: "tour" as const,
        location: event.state ? `${event.location} (${event.state})` : event.location,
        venueName: event.venue_name,
        date: new Date(event.start_time),
        source: event.source,
      });
    });
    
    // Travel bookings
    travelBookings.forEach((booking) => {
      let title = "";
      if (booking.booking_type === "train" || booking.booking_type === "flight") {
        title = `${booking.origin_city || "?"} → ${booking.destination_city}`;
      } else if (booking.booking_type === "hotel") {
        title = booking.venue_name || booking.destination_city;
      } else {
        title = booking.destination_city;
      }
      
      items.push({
        id: booking.id,
        title,
        type: "travel" as const,
        location: booking.destination_city,
        venueName: booking.venue_name,
        provider: booking.provider,
        bookingType: booking.booking_type,
        date: new Date(booking.start_datetime),
      });
    });
    
    // Calendar events
    calendarEvents.forEach((event) => {
      items.push({
        id: event.id,
        title: event.title,
        type: "calendar" as const,
        location: event.location,
        date: new Date(event.start_datetime),
      });
    });
    
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, travelBookings, calendarEvents]);

  const handleSearchSelect = (item: { id: string; type: string }) => {
    // Navigate to appropriate tab and highlight the item
    if (item.type === "tour") {
      setSearchParams({ tab: "map", activeEventId: item.id });
    } else if (item.type === "travel") {
      setSearchParams({ tab: "travel" });
      // Could add a query param to highlight specific booking
    } else {
      setSearchParams({ tab: "calendar" });
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
      {/* Command Palette */}
      <AdminCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onQuickAdd={() => {
          // Navigate to calendar and trigger quick add
          setSearchParams({ tab: "calendar" });
        }}
        onExportCalendar={() => {
          // This would open export modal - for now navigate to calendar
          setSearchParams({ tab: "calendar" });
        }}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Premium Pill-Style Tabs + Search */}
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-gray-50/80 backdrop-blur-md border-b border-gray-100 hidden md:block">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Tabs - Desktop only */}
            <TabsList className="inline-flex p-1 bg-white rounded-full shadow-sm border border-gray-200 gap-1">
              <TabsTrigger 
                value="calendar" 
                className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
              >
                <CalendarDays className="w-4 h-4 mr-2 inline-block" />
                <span className="hidden sm:inline">Plan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
              >
                <MapPin className="w-4 h-4 mr-2 inline-block" />
                <span className="hidden sm:inline">Tour</span>
              </TabsTrigger>
              <TabsTrigger 
                value="travel" 
                className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
              >
                <Plane className="w-4 h-4 mr-2 inline-block" />
                <span className="hidden sm:inline">Trips</span>
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
              >
                <CloudDownload className="w-4 h-4 mr-2 inline-block" />
                <span className="hidden sm:inline">Drops</span>
              </TabsTrigger>
              <TabsTrigger 
                value="picks" 
                className="relative px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-all duration-200 data-[state=active]:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm"
              >
                <Heart className="w-4 h-4 mr-2 inline-block" />
                <span className="hidden sm:inline">Picks</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Search Bar - Now second */}
            <AdminSearchBar items={searchableItems} onSelect={handleSearchSelect} />
          </div>
        </div>

        <div className="mt-6">
          <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
            <Suspense fallback={<TabFallback />}>
              <FullCalendar
                onNavigateToTravel={(bookingId) => {
                  setSearchParams({ tab: "travel" });
                }}
                onNavigateToTour={(eventId) => {
                  setSearchParams({ tab: "map", activeEventId: eventId });
                }}
                onEventsAdded={fetchEvents}
                refreshTrigger={dataVersion}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="map" className="mt-0 focus-visible:outline-none">
            {/* Sub-tab navigation: Karte / VVK-Freigabe */}
            <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-100">
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete("subtab");
                  setSearchParams(newParams);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                  mapSubTab === "karte"
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <MapPin className="w-4 h-4" />
                Karte
              </button>
              <button
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("subtab", "vvk");
                  setSearchParams(newParams);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                  mapSubTab === "vvk"
                    ? "bg-amber-50 text-amber-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <Ticket className="w-4 h-4" />
                VVK-Freigabe
              </button>
            </div>
            <Suspense fallback={<TabFallback />}>
              {mapSubTab === "karte" ? (
                <EventMap
                  events={events}
                  onEventsUpdated={fetchEvents}
                  initialActiveEventId={searchParams.get("activeEventId") || undefined}
                />
              ) : (
                <VvkApprovalPanel onApprovalChanged={fetchEvents} standalone />
              )}
            </Suspense>
          </TabsContent>

          <TabsContent value="travel" className="mt-0 focus-visible:outline-none pb-20 md:pb-0">
            <Suspense fallback={<TabFallback />}>
              <TravelDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="documents" className="mt-0 focus-visible:outline-none pb-20 md:pb-0">
            <Suspense fallback={<TabFallback />}>
              <DocumentsPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="picks" className="mt-0 focus-visible:outline-none pb-20 md:pb-0">
            <Suspense fallback={<TabFallback />}>
              <PicksPanel isAdmin={isAdmin} />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 focus-visible:outline-none pb-20 md:pb-0">
            <Suspense fallback={<TabFallback />}>
              <SettingsPanel isAdmin={isAdmin} />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
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
                className="w-full py-3 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full py-3 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
              className="w-full py-3 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
