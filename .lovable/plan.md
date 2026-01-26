
# Dokumente-Bereich im Admin mit öffentlichen Download-Links

## Übersicht

Neuer "Dokumente"-Tab im Admin-Bereich, der interne Dokumente (Dossiers, Flyer) verwaltet und **öffentlich teilbare Download-Links** generiert - ohne dass Empfänger sich anmelden müssen.

## Funktionen

### Für Admins (im Admin-Bereich)
- **Dokumente hochladen**: Drag & Drop oder Datei-Auswahl für PDFs und andere Dateien
- **Bestehende Dokumente verwalten**: Liste aller hochgeladenen Dokumente mit Vorschau
- **Kategorie zuweisen**: Produktions-Dossier, Presse-Dossier, Flyer, Sonstiges
- **Link kopieren**: Ein Klick kopiert den öffentlichen Download-Link
- **Link teilen**: Direktes Teilen per E-Mail oder WhatsApp
- **Dokumente ersetzen**: Neue Version hochladen, alte ersetzen
- **Dokumente löschen**: Nicht mehr benötigte Dateien entfernen

### Für Externe (ohne Login)
- **Direkter Download**: Öffentlicher Link funktioniert ohne Anmeldung
- **Download-Seite**: Schöne Seite mit Dokumentname, Größe und Download-Button
- **Download-Tracking**: Zählt wie oft ein Dokument heruntergeladen wurde (optional)

## Warum kein PSITransfer?

PSITransfer ist eine separate Node.js-Anwendung, die:
- Auf einem eigenen Server gehostet werden müsste
- Zusätzliche Wartung erfordert
- Nicht nativ in Lovable/Supabase integriert ist

**Bessere Lösung**: Ein **öffentlicher Storage-Bucket** mit einer schönen Download-Seite bietet dieselben Vorteile:
- Große Dateien möglich (bis 50MB)
- Öffentliche Links ohne Anmeldung
- Nativ integriert, keine zusätzliche Infrastruktur
- Schöne Branding-Seite beim Download

## Technische Umsetzung

### 1. Datenbank-Tabelle `internal_documents`

```text
┌────────────────────────────────────────────────────────────┐
│ internal_documents                                          │
├────────────────┬───────────────────────────────────────────┤
│ id             │ UUID (Primary Key)                        │
│ name           │ Anzeigename (z.B. "Presse-Dossier v2.2") │
│ category       │ "dossier_produktion" | "dossier_presse"   │
│                │ | "flyer" | "other"                       │
│ file_path      │ Pfad im Storage-Bucket                    │
│ file_name      │ Originaler Dateiname                      │
│ file_size      │ Größe in Bytes                            │
│ content_type   │ MIME-Type (application/pdf)               │
│ download_count │ Anzahl Downloads                          │
│ created_at     │ Upload-Zeitpunkt                          │
│ updated_at     │ Letztes Update                            │
│ uploaded_by    │ User-ID des Uploaders                     │
└────────────────┴───────────────────────────────────────────┘
```

### 2. Storage-Bucket `internal-documents`

- **Öffentlicher Bucket**: Dateien sind ohne Authentifizierung zugänglich
- **Direkter Download**: `https://{project}.supabase.co/storage/v1/object/public/internal-documents/{path}`
- **Große Dateien**: Bis 50MB unterstützt

### 3. Neue Dateien

```text
src/
├── components/admin/
│   └── DocumentsPanel.tsx        # Hauptkomponente für Dokumente-Tab
│   └── DocumentUploadModal.tsx   # Upload-Dialog mit Drag & Drop
│   └── DocumentCard.tsx          # Karte für einzelnes Dokument
│
├── pages/
│   └── Download.tsx              # Öffentliche Download-Seite (/download/:id)
│
└── lib/
    └── documentUtils.ts          # Hilfsfunktionen (Größe formatieren, etc.)

supabase/
└── migrations/
    └── xxx_create_internal_documents.sql
```

### 4. UI-Design

#### Admin-Ansicht (Dokumente-Tab)
```text
┌─────────────────────────────────────────────────────────────────┐
│  📁 Dokumente                                    [+ Hochladen]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📑 DOSSIERS                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 Produktions-Dossier                          2.4 MB  │   │
│  │    Hochgeladen: 15.01.2026                              │   │
│  │    Downloads: 42                                        │   │
│  │    [📋 Link kopieren] [↗ Teilen] [🗑 Löschen]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 Presse-Dossier v2.2                          1.8 MB  │   │
│  │    Hochgeladen: 20.01.2026                              │   │
│  │    Downloads: 128                                       │   │
│  │    [📋 Link kopieren] [↗ Teilen] [🗑 Löschen]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📄 FLYER                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 Tour-Flyer 2026                              850 KB  │   │
│  │    Hochgeladen: 10.01.2026                              │   │
│  │    Downloads: 67                                        │   │
│  │    [📋 Link kopieren] [↗ Teilen] [🗑 Löschen]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Upload-Modal
```text
┌─────────────────────────────────────────────────────────────┐
│  Dokument hochladen                                     [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │                                                       │  │
│  │            📁 Datei hierher ziehen                   │  │
│  │                                                       │  │
│  │        oder  [Datei auswählen]                       │  │
│  │                                                       │  │
│  │        ○ Neue Datei hochladen                        │  │
│  │        ○ Bestehende Datei auswählen                  │  │
│  │                                                       │  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                             │
│  Name:                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Presse-Dossier v2.2                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Kategorie:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Presse-Dossier                               ▼      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│              [Abbrechen]  [Hochladen]                       │
└─────────────────────────────────────────────────────────────┘
```

#### Öffentliche Download-Seite (`/download/:id`)
```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    🎭 PATER BROWN                           │
│                    Das Live-Hörspiel                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      📄                                     │
│                                                             │
│               Presse-Dossier v2.2                           │
│                                                             │
│                    PDF • 1.8 MB                             │
│                                                             │
│              ┌──────────────────────┐                       │
│              │   ⬇ Herunterladen   │                       │
│              └──────────────────────┘                       │
│                                                             │
│                                                             │
│         Bereitgestellt von paterbrown.com                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5. Navigation erweitern

**Desktop-Tabs** (Admin.tsx):
- Kalender | Tour | Reisen | Upload | **Dokumente**

**Mobile BottomNav** (BottomNav.tsx):
- Da nur 4 Plätze: Upload durch Dokumente ersetzen, oder expandierbares "Mehr"-Menü

### 6. Link-Sharing Optionen

Beim Klick auf "Teilen":
- **Link kopieren**: Kopiert öffentlichen Link in Zwischenablage
- **Per E-Mail teilen**: Öffnet E-Mail-Programm mit vorausgefülltem Link
- **Per WhatsApp teilen**: Öffnet WhatsApp mit Link

Link-Format:
```
https://paterbrown-com.lovable.app/download/abc123
```

## Implementierungs-Schritte

1. **Datenbank-Migration**: `internal_documents` Tabelle + öffentlicher Storage-Bucket
2. **DocumentsPanel**: Hauptkomponente mit Dokumenten-Liste nach Kategorie
3. **DocumentUploadModal**: Upload-Dialog mit Drag & Drop + Kategorie-Auswahl
4. **DocumentCard**: Karte mit Aktionen (Link kopieren, teilen, löschen)
5. **Download-Seite**: Öffentliche `/download/:id` Route mit Branding
6. **Navigation**: "Dokumente"-Tab in Desktop und Mobile hinzufügen
7. **Bestehende Datei auswählen**: Option um bereits hochgeladene Dateien erneut zu verwenden

## Vorteile gegenüber PSITransfer

| Feature | PSITransfer | Lovable-Lösung |
|---------|-------------|----------------|
| Installation | Separater Server nötig | Integriert |
| Wartung | Updates, Backups | Automatisch |
| Branding | Muss angepasst werden | Pater Brown Design |
| Integration | Keine | Volle Admin-Integration |
| Kosten | Server-Kosten | Inklusive |
| Große Dateien | Ja | Bis 50MB |
| Link-Ablauf | Konfigurierbar | Permanent |
