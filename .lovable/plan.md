

# Pending Traveler Approvals System

## Ziel
Statt automatischer Profilerstellung bei unbekannten Reisenden-Namen wird ein Genehmigungseintrag erstellt, den der Admin im Travel-Dashboard bestaetigen oder ablehnen kann.

## Aenderungen

### 1. Datenbank-Migration
Die bereitgestellte SQL-Migration wird ausgefuehrt:
- Neue Tabelle `pending_traveler_approvals` mit Status-Workflow (pending, approved, linked, dismissed)
- Fuzzy-Match-Kontext (bester Treffer, Score, Profil-ID)
- Quell-Verknuepfung (Email, Attachment)
- RLS-Policies fuer Admin und Service Role
- `updated_at`-Trigger
- Indexes auf status, extracted_name, source_email_id
- RPC-Funktion `replace_traveler_name_in_arrays` zum Ersetzen von Namen in `traveler_names`-Arrays

**Anpassung**: Der `CHECK`-Constraint auf `status` wird durch einen Validation-Trigger ersetzt (Lovable-Guideline, da CHECK-Constraints bei Restores Probleme verursachen koennen).

### 2. Edge Function: `analyze-travel-booking`
Die Funktion `autoCreateTravelerProfile` wird durch `createPendingApproval` ersetzt:

- Wenn Fuzzy-Match-Score >= 70: Weiterhin automatisch zuordnen (wie bisher)
- Wenn Score < 70 aber Name extrahiert: Statt Auto-Create wird ein Eintrag in `pending_traveler_approvals` erstellt mit:
  - `extracted_name`, `extracted_first_name`, `extracted_last_name`
  - `best_match_name`, `best_match_score`, `best_match_profile_id` (bester Treffer, auch wenn unter Schwelle)
  - `source_email_id`, `source_attachment_id`
  - Status = `pending`
- Der Attachment-Eintrag erhaelt weiterhin den extrahierten Namen als `traveler_name` (vorlaeufig)

### 3. UI: Approval-Banner im Travel-Dashboard
In `TravelDashboard.tsx` wird eine Benachrichtigungs-Sektion eingebaut:

- Oberhalb der Buchungen erscheint ein kompaktes Banner wenn `pending`-Approvals existieren
- Zeigt Anzahl ausstehender Genehmigungen mit Amber-Akzent
- Klick oeffnet den Approval-Flow

### 4. Neue Komponente: `PendingTravelerApprovals.tsx`
Modaler Dialog oder Panel im Troupe-Design mit:

- **Liste aller Pending Approvals** als Cards mit:
  - Extrahierter Name (fett)
  - Bester Match-Vorschlag mit Score-Anzeige (Fortschrittsbalken)
  - Quelle (Email-Betreff oder Attachment-Name)
  - Zeitstempel
- **Aktionen pro Eintrag**:
  - **"Neues Profil erstellen"** -- Erstellt Profil aus extrahiertem Namen, setzt Status auf `approved`
  - **"Zuordnen"** -- Dropdown mit existierenden Profilen, setzt Status auf `linked`, ruft `replace_traveler_name_in_arrays` auf
  - **"Verwerfen"** -- Setzt Status auf `dismissed`
- **Bulk-Aktionen**: Alle mit gleichem Namen auf einmal aufloesen

### 5. Integration in Profiles-Tab
Im `TravelerProfileEditor.tsx` wird ein kleiner Hinweis-Badge angezeigt, wenn Pending Approvals existieren, die auf die Approval-Ansicht verlinken.

## Technische Details

```text
Ablauf bei unbekanntem Reisenden:

  Dokument-Upload
       |
  AI extrahiert Namen
       |
  Fuzzy Match gegen bekannte Profile
       |
  Score >= 70?
   /        \
 JA          NEIN
  |            |
Zuordnen   pending_traveler_approvals
wie bisher   INSERT (status=pending)
              |
         Admin sieht Banner
              |
    "Neues Profil" / "Zuordnen" / "Verwerfen"
              |
         Status-Update + ggf. replace_traveler_name_in_arrays()
```

### Dateien die erstellt/geaendert werden:
- **Erstellt**: Migration SQL (Tabelle + RPC + Trigger + Indexes)
- **Erstellt**: `src/components/admin/PendingTravelerApprovals.tsx`
- **Geaendert**: `supabase/functions/analyze-travel-booking/index.ts` (autoCreate durch Approval ersetzen)
- **Geaendert**: `src/components/admin/TravelDashboard.tsx` (Banner + Approval-Integration)
- **Geaendert**: `src/components/admin/TravelerProfileEditor.tsx` (Badge-Hinweis)

