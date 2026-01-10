import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  User, CreditCard, Settings, Save, Loader2, 
  FileDown, Copy, Check, Calendar, Phone, Train
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface TravelerProfile {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  phone_number: string | null;
  bahncard_type: string | null;
  bahncard_class: number | null;
  bahncard_number: string | null;
  bahncard_valid_until: string | null;
  preferred_seat: string | null;
  preferred_class: number | null;
}

const BAHNCARD_TYPES = [
  { value: "BC 25", label: "BahnCard 25" },
  { value: "BC 50", label: "BahnCard 50" },
  { value: "BC 100", label: "BahnCard 100" },
  { value: "Probe BC 25", label: "Probe BahnCard 25" },
  { value: "Probe BC 50", label: "Probe BahnCard 50" },
];

const SEAT_PREFERENCES = [
  { value: "Fenster", label: "Fensterplatz" },
  { value: "Gang", label: "Gangplatz" },
  { value: "Tisch", label: "Am Tisch" },
  { value: "Ruhebereich", label: "Ruhebereich" },
  { value: "egal", label: "Egal" },
];

export default function TravelerProfileEditor() {
  const [profiles, setProfiles] = useState<TravelerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfiles, setEditedProfiles] = useState<Map<string, Partial<TravelerProfile>>>(new Map());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportText, setExportText] = useState("");
  const [exportProfileName, setExportProfileName] = useState("");
  const [allExportModalOpen, setAllExportModalOpen] = useState(false);
  const [allExportText, setAllExportText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("traveler_profiles")
        .select("*")
        .order("last_name", { ascending: true });

      if (error) throw error;
      setProfiles((data as TravelerProfile[]) || []);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Fehler",
        description: "Profile konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (profileId: string, field: keyof TravelerProfile, value: any) => {
    setEditedProfiles(prev => {
      const updated = new Map(prev);
      const existing = updated.get(profileId) || {};
      updated.set(profileId, { ...existing, [field]: value });
      return updated;
    });
  };

  const getFieldValue = (profile: TravelerProfile, field: keyof TravelerProfile) => {
    const edited = editedProfiles.get(profile.id);
    if (edited && field in edited) {
      return edited[field];
    }
    return profile[field];
  };

  const saveProfile = async (profileId: string) => {
    const changes = editedProfiles.get(profileId);
    if (!changes) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("traveler_profiles")
        .update(changes)
        .eq("id", profileId);

      if (error) throw error;

      // Update local state
      setProfiles(prev => prev.map(p => 
        p.id === profileId ? { ...p, ...changes } : p
      ));
      
      // Clear edited state
      setEditedProfiles(prev => {
        const updated = new Map(prev);
        updated.delete(profileId);
        return updated;
      });

      toast({
        title: "Gespeichert",
        description: "Profil wurde aktualisiert",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("traveler_profiles")
        .insert({
          first_name: "Neu",
          last_name: "Reisende/r",
          preferred_class: 2,
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfiles(prev => [...prev, data as TravelerProfile]);
      toast({
        title: "Profil erstellt",
        description: "Neues Profil wurde angelegt",
      });
    } catch (error: any) {
      console.error("Error creating profile:", error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const generateTravelSheet = (profile: TravelerProfile): string => {
    const lines: string[] = [];
    lines.push(`REISEBLATT - ${profile.first_name} ${profile.last_name}`);
    lines.push("");
    lines.push("PERSÖNLICHE DATEN");
    lines.push(`Vorname:           ${profile.first_name}`);
    lines.push(`Nachname:          ${profile.last_name}`);
    if (profile.birth_date) {
      lines.push(`Geburtsdatum:      ${format(parseISO(profile.birth_date), "dd.MM.yyyy", { locale: de })}`);
    }
    if (profile.phone_number) {
      lines.push(`Telefon:           ${profile.phone_number}`);
    }
    lines.push("");
    
    if (profile.bahncard_type || profile.bahncard_number) {
      lines.push("BAHNCARD");
      if (profile.bahncard_type) {
        lines.push(`Art:               ${profile.bahncard_type}`);
      }
      if (profile.bahncard_class) {
        lines.push(`Klasse:            ${profile.bahncard_class}. Klasse`);
      }
      if (profile.bahncard_number) {
        lines.push(`Nummer:            ${profile.bahncard_number}`);
      }
      if (profile.bahncard_valid_until) {
        lines.push(`Gültig bis:        ${format(parseISO(profile.bahncard_valid_until), "dd.MM.yyyy", { locale: de })}`);
      }
      lines.push("");
    }
    
    lines.push("PRÄFERENZEN");
    if (profile.preferred_class) {
      lines.push(`Klasse:            ${profile.preferred_class}. Klasse`);
    }
    if (profile.preferred_seat) {
      lines.push(`Sitzplatz:         ${profile.preferred_seat}`);
    }
    
    return lines.join("\n");
  };

  const openExportModal = (profile: TravelerProfile) => {
    const text = generateTravelSheet(profile);
    setExportText(text);
    setExportProfileName(`${profile.first_name} ${profile.last_name}`);
    setExportModalOpen(true);
  };

  const copyExportText = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopiedId("export-modal");
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Kopiert",
        description: "Reiseblatt wurde in die Zwischenablage kopiert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  const openAllExportModal = () => {
    const allSheets = profiles.map(p => generateTravelSheet(p)).join("\n\n---\n\n");
    setAllExportText(allSheets);
    setAllExportModalOpen(true);
  };

  const copyAllExportText = async () => {
    try {
      await navigator.clipboard.writeText(allExportText);
      setCopiedId("all-export-modal");
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Kopiert",
        description: "Alle Reiseblätter wurden in die Zwischenablage kopiert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reisende-Profile</h2>
          <p className="text-sm text-gray-500">
            Verwalte persönliche Daten und BahnCard-Informationen
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="apple"
            onClick={openAllExportModal}
            disabled={profiles.length === 0}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            Alle exportieren
          </Button>
          <Button onClick={addNewProfile} className="gap-2">
            <User className="w-4 h-4" />
            Neues Profil
          </Button>
        </div>
      </div>

      {/* Profile Cards */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <User className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Keine Profile vorhanden
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Erstelle ein Profil für jeden Reisenden
          </p>
          <Button onClick={addNewProfile} className="gap-2">
            <User className="w-4 h-4" />
            Erstes Profil erstellen
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {profiles.map(profile => {
            const hasChanges = editedProfiles.has(profile.id);
            
            return (
              <div
                key={profile.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                {/* Profile Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getFieldValue(profile, "first_name")} {getFieldValue(profile, "last_name")}
                      </h3>
                      {profile.bahncard_type && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Train className="w-3.5 h-3.5" />
                          {profile.bahncard_type}
                          {profile.bahncard_valid_until && (
                            <> • bis {format(parseISO(profile.bahncard_valid_until), "MM/yyyy")}</>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openExportModal(profile)}
                      className="gap-2 text-gray-500 hover:text-gray-900"
                    >
                      <FileDown className="w-4 h-4" />
                      Export
                    </Button>
                    {hasChanges && (
                      <Button
                        size="sm"
                        onClick={() => saveProfile(profile.id)}
                        disabled={isSaving}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Speichern
                      </Button>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div className="p-6 space-y-6">
                  {/* Personal Data Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Persönliche Daten
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">Vorname</Label>
                        <Input
                          value={getFieldValue(profile, "first_name") || ""}
                          onChange={(e) => handleFieldChange(profile.id, "first_name", e.target.value)}
                          className="bg-gray-50/50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">Nachname</Label>
                        <Input
                          value={getFieldValue(profile, "last_name") || ""}
                          onChange={(e) => handleFieldChange(profile.id, "last_name", e.target.value)}
                          className="bg-gray-50/50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Geburtsdatum
                        </Label>
                        <Input
                          type="date"
                          value={getFieldValue(profile, "birth_date") || ""}
                          onChange={(e) => handleFieldChange(profile.id, "birth_date", e.target.value)}
                          className="bg-gray-50/50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          Telefon
                        </Label>
                        <Input
                          value={getFieldValue(profile, "phone_number") || ""}
                          onChange={(e) => handleFieldChange(profile.id, "phone_number", e.target.value)}
                          placeholder="+49..."
                          className="bg-gray-50/50 border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BahnCard Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      BahnCard
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">BahnCard Art</Label>
                        <Select
                          value={String(getFieldValue(profile, "bahncard_type") ?? "")}
                          onValueChange={(value) => handleFieldChange(profile.id, "bahncard_type", value)}
                        >
                          <SelectTrigger className="bg-gray-50/50 border-gray-200">
                            <SelectValue placeholder="Keine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Keine BahnCard</SelectItem>
                            {BAHNCARD_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">BahnCard Klasse</Label>
                        <Select
                          value={getFieldValue(profile, "bahncard_class")?.toString() || ""}
                          onValueChange={(value) => handleFieldChange(profile.id, "bahncard_class", parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-50/50 border-gray-200">
                            <SelectValue placeholder="Wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1. Klasse</SelectItem>
                            <SelectItem value="2">2. Klasse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">BahnCard Nummer</Label>
                        <Input
                          value={getFieldValue(profile, "bahncard_number") || ""}
                          onChange={(e) => handleFieldChange(profile.id, "bahncard_number", e.target.value)}
                          placeholder="7081 4101 ..."
                          className="bg-gray-50/50 border-gray-200 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">Gültig bis</Label>
                        <Input
                          type="date"
                          value={getFieldValue(profile, "bahncard_valid_until") || ""}
                          onChange={(e) => handleFieldChange(profile.id, "bahncard_valid_until", e.target.value)}
                          className="bg-gray-50/50 border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferences Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Präferenzen
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">Bevorzugte Klasse</Label>
                        <Select
                          value={(getFieldValue(profile, "preferred_class") ?? 2).toString()}
                          onValueChange={(value) => handleFieldChange(profile.id, "preferred_class", parseInt(value))}
                        >
                          <SelectTrigger className="bg-gray-50/50 border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1. Klasse</SelectItem>
                            <SelectItem value="2">2. Klasse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-600">Sitzplatz-Präferenz</Label>
                        <Select
                          value={String(getFieldValue(profile, "preferred_seat") ?? "")}
                          onValueChange={(value) => handleFieldChange(profile.id, "preferred_seat", value)}
                        >
                          <SelectTrigger className="bg-gray-50/50 border-gray-200">
                            <SelectValue placeholder="Wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {SEAT_PREFERENCES.map(pref => (
                              <SelectItem key={pref.value} value={pref.value}>
                                {pref.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export Modal - Single Profile */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Reiseblatt: {exportProfileName}</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-900 whitespace-pre-wrap max-h-[400px] overflow-y-auto border border-gray-200">
            {exportText}
          </div>
          <DialogFooter>
            <Button variant="apple" onClick={() => setExportModalOpen(false)}>
              Schließen
            </Button>
            <Button onClick={copyExportText} className="gap-2">
              {copiedId === "export-modal" ? (
                <>
                  <Check className="w-4 h-4" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  In Zwischenablage kopieren
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal - All Profiles */}
      <Dialog open={allExportModalOpen} onOpenChange={setAllExportModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-white text-gray-900 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Alle Reiseblätter</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-900 whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-gray-200">
            {allExportText}
          </div>
          <DialogFooter>
            <Button variant="apple" onClick={() => setAllExportModalOpen(false)}>
              Schließen
            </Button>
            <Button onClick={copyAllExportText} className="gap-2">
              {copiedId === "all-export-modal" ? (
                <>
                  <Check className="w-4 h-4" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Alle kopieren
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
