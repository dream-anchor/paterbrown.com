# SEO-Playbook: Universelles Template für Vite + React + TS Projekte

> Vollständige Dokumentation aller SEO-Optimierungen als Referenz für Claude Code.
> Domain-unabhängig — für jedes Projekt adaptierbar.

**Stack:** Vite + React + TypeScript + Tailwind + shadcn/ui + Supabase + Apache (IONOS o.ä.)

---

## Projekt-Konfiguration (ZUERST AUSFÜLLEN)

Vor der Implementierung alle Platzhalter in dieser Tabelle ersetzen. Im gesamten Dokument werden diese Platzhalter als `{{VARIABLE}}` geschrieben.

| Variable | Beschreibung | Beispiel |
|----------|-------------|---------|
| `{{DOMAIN}}` | Produktiv-Domain mit www | `https://www.meine-seite.de` |
| `{{DOMAIN_NAKED}}` | Domain ohne Protokoll | `meine-seite.de` |
| `{{BRAND}}` | Markenname / Firmenname | `Mein Unternehmen` |
| `{{BRAND_SHORT}}` | Kurzname | `MU` |
| `{{LANGUAGES}}` | Unterstützte Sprachen (Array) | `["de", "en"]` |
| `{{DEFAULT_LANG}}` | Standard-Sprache (ohne URL-Prefix) | `de` |
| `{{GA4_ID}}` | Google Analytics 4 Measurement ID | `G-XXXXXXXXXX` |
| `{{SUPABASE_URL}}` | Supabase Project URL | `https://xxx.supabase.co` |
| `{{SUPABASE_ANON_KEY}}` | Supabase Anon Key | `eyJ...` |
| `{{GSC_SITE}}` | Google Search Console Property | `sc-domain:meine-seite.de` |
| `{{PHONE}}` | Telefonnummer (E.164) | `+49 89 12345678` |
| `{{EMAIL}}` | Kontakt-E-Mail | `info@meine-seite.de` |
| `{{WHATSAPP}}` | WhatsApp-Nummer (ohne +) | `4989123456` |
| `{{STREET}}` | Straße + Hausnummer | `Musterstraße 1` |
| `{{CITY}}` | Stadt | `München` |
| `{{ZIP}}` | PLZ | `80000` |
| `{{REGION}}` | Bundesland / Region | `Bayern` |
| `{{COUNTRY}}` | Ländercode | `DE` |
| `{{GEO_REGION}}` | Geo-Region (ISO 3166-2) | `DE-BY` |
| `{{LAT}}` | Breitengrad | `48.1351` |
| `{{LNG}}` | Längengrad | `11.5820` |
| `{{MAPS_CID}}` | Google Maps CID | `12345678901234567` |
| `{{INSTAGRAM}}` | Instagram-URL | `https://instagram.com/xxx` |
| `{{OG_IMAGE}}` | Standard-OG-Bild (1200×630) | `/images/og-default.jpg` |
| `{{THEME_COLOR}}` | Primäre Markenfarbe (Hex) | `#722F37` |
| `{{BG_COLOR}}` | Hintergrundfarbe (Hex) | `#FAF8F5` |
| `{{SCHEMA_TYPE}}` | Haupt-Schema.org-Typ | `Restaurant`, `EventVenue`, `LocalBusiness` |
| `{{PRICE_RANGE}}` | Preisspanne | `€€–€€€` |
| `{{LOCALSTORAGE_KEY}}` | Key für Sprachspeicherung | `meine-seite-language` |

---

## Inhaltsverzeichnis

1. [Build-Pipeline & SSG (Static Site Generation)](#1-build-pipeline--ssg-static-site-generation)
2. [Warum SSG: SEO- und GEO-Optimierung](#2-warum-ssg-seo--und-geo-optimierung)
3. [SEO-Komponente & Meta-Tags](#3-seo-komponente--meta-tags)
4. [Structured Data / JSON-LD](#4-structured-data--json-ld)
5. [i18n-URL-Architektur & Routing](#5-i18n-url-architektur--routing)
6. [Translation-System](#6-translation-system)
7. [.htaccess — Server-Konfiguration](#7-htaccess--server-konfiguration)
8. [Sitemap-Generierung](#8-sitemap-generierung)
9. [robots.txt & AI-Crawler](#9-robotstxt--ai-crawler)
10. [FAQ-Pattern für SEO](#10-faq-pattern-für-seo)
11. [Bild- & Video-Optimierung](#11-bild---video-optimierung)
12. [Landing-Page-Blueprint](#12-landing-page-blueprint)
13. [SEO-Operations-System (Monitoring & Alerting)](#13-seo-operations-system-monitoring--alerting)
14. [PWA & Web App Manifest](#14-pwa--web-app-manifest)
15. [Performance & Core Web Vitals](#15-performance--core-web-vitals)
16. [Checkliste: Neue Seite SEO-ready machen](#16-checkliste-neue-seite-seo-ready-machen)

---

## 1. Build-Pipeline & SSG (Static Site Generation)

### Zweck

Jede Seite wird zur **Build-Zeit** als vollständiges statisches HTML vorgerendert (SSG = Static Site Generation). Suchmaschinen und AI-Crawler erhalten fertiges HTML mit Meta-Tags, JSON-LD und Content — **kein Client-Side-Only Rendering**.

### Warum SSG entscheidend ist

Standardmäßig rendert eine Vite+React-App nur eine leere `<div id="root"></div>` — Suchmaschinen und AI-Crawler sehen keinen Content. SSG löst dieses Problem, indem zur Build-Zeit für jede Route eine fertige HTML-Datei erzeugt wird.

### Vorlage-Dateien

| Datei | Zweck |
|-------|-------|
| `vite.config.ts` | SSR-Konfiguration, Aliase |
| `package.json` (Scripts) | Build-Reihenfolge |
| `src/entry-server.tsx` | SSR-Rendering-Logik |
| `prerender.js` | HTML-Generierung für alle Routen |
| `src/hooks/usePrerenderReady.ts` | Signal für Prerender-Completion |

### Build-Reihenfolge

```json
{
  "build": "npm run build:client && npm run build:server && npm run build:prerender && npm run generate:sitemap",
  "build:client": "vite build",
  "build:server": "vite build --ssr src/entry-server.tsx --outDir dist/server",
  "build:prerender": "node prerender.js",
  "generate:sitemap": "node scripts/generate-sitemap.mjs"
}
```

**Ablauf:**

1. **build:client** — Vite erstellt Client-Bundle (JS, CSS, Assets) in `dist/`
2. **build:server** — Vite erstellt SSR-Bundle in `dist/server/entry-server.js`
3. **build:prerender** — Node-Script rendert alle Routen zu statischem HTML
4. **generate:sitemap** — Erzeugt `dist/sitemap.xml` mit allen URLs + hreflang

### vite.config.ts — Kritische SSR-Einstellungen

```ts
export default defineConfig(({ mode, isSsrBuild }) => ({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: [
      // SSR-safe Supabase Client (keine Browser-APIs im Server-Build)
      ...(isSsrBuild ? [{
        find: /^@\/integrations\/supabase\/client$/,
        replacement: path.resolve(__dirname, "./src/integrations/supabase/client.ssr.ts"),
      }] : []),
      { find: /^@\//, replacement: path.resolve(__dirname, "./src") + "/" },
    ],
  },
  ssr: {
    // KRITISCH: react-helmet-async muss gebündelt werden (CJS/ESM Interop)
    noExternal: ["react-helmet-async"],
  },
}));
```

> **Hinweis:** `client.ssr.ts` ist eine Variante des Supabase-Clients die `createClient` ohne `localStorage` oder andere Browser-APIs nutzt. So crasht der Server-Build nicht.

### entry-server.tsx — SSR-Rendering

```tsx
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query'
import App from './App'

export function render(url: string, context = {}) {
  const helmetContext = {} as any
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })

  // Optional: Cache mit Server-Daten vorfüllen (z.B. Menüs, Events)
  if (context.prefetchData && context.queryKey) {
    queryClient.setQueryData(context.queryKey, context.prefetchData)
  }

  const html = ReactDOMServer.renderToString(
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>
    </QueryClientProvider>
  )

  const { helmet } = helmetContext
  const dehydratedState = dehydrate(queryClient)
  return { html, helmet, dehydratedState }
}
```

### prerender.js — HTML-Generierung (Kernlogik)

```js
// Für jede Route:
const { html, helmet, dehydratedState } = render(url, context);

// 1. App-HTML in Template injizieren
let finalHtml = template.replace(
  /<div id="root">(?:<!--app-html-->|\s)*<\/div>/,
  `<div id="root">${html}</div>`
);

// 2. React Query State für Hydration injizieren
if (dehydratedState?.queries?.length > 0) {
  const stateScript = `<script>window.__REACT_QUERY_STATE__=${JSON.stringify(dehydratedState)}</script>`;
  finalHtml = finalHtml.replace("</head>", `${stateScript}</head>`);
}

// 3. Helmet SEO-Tags injizieren (title, meta, link, script)
if (helmet) {
  const helmetHtml = [
    helmet.title?.toString(),
    helmet.meta?.toString(),
    helmet.link?.toString(),
    helmet.script?.toString(),
  ].filter(Boolean).join('\n');
  finalHtml = finalHtml.replace("</head>", `${helmetHtml}</head>`);
}

// 4. Ordnerstruktur für Apache-Hosting (verhindert 403)
// /en/ → dist/en/index.html
const cleanUrl = url === '/' ? '' : url.replace(/\/$/, '');
const filePath = `dist${cleanUrl}/index.html`;
fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, finalHtml);
```

### usePrerenderReady Hook

```tsx
// In jeder SSG-gerenderten Seite aufrufen:
usePrerenderReady(true);
// Setzt data-prerender-ready Attribut auf <html> und dispatcht Event
// prerender.js wartet auf dieses Signal bevor es den HTML-Snapshot nimmt
```

### Ergebnis nach Build

```
dist/
├── index.html                    ← / (DE Homepage)
├── en/
│   └── index.html                ← /en/ (EN Homepage)
├── kontakt/
│   └── index.html                ← /kontakt/ (DE)
├── en/contact/
│   └── index.html                ← /en/contact/ (EN)
├── sitemap.xml
├── robots.txt
└── assets/                       ← JS, CSS, Bilder (hashed)
```

Jede HTML-Datei enthält:
- Vollständigen `<title>` und `<meta description>`
- Canonical URL und hreflang-Tags
- Komplettes JSON-LD (Schema.org)
- Gerenderten Seiteninhalt (H1, Texte, FAQ-Antworten)
- React Query Hydration State

---

## 2. Warum SSG: SEO- und GEO-Optimierung

### Das Problem: Client-Side Rendering (CSR)

Eine Standard Vite+React-App liefert nur diese HTML-Antwort:

```html
<html>
  <head><title>Vite App</title></head>
  <body>
    <div id="root"></div>
    <script src="/assets/main-abc123.js"></script>
  </body>
</html>
```

**Konsequenzen:**
- Googlebot sieht initial keinen Content (erst nach JS-Execution)
- Google muss die Seite in einer zweiten Render-Queue verarbeiten (Tage bis Wochen Verzögerung)
- Meta-Tags, JSON-LD, hreflang werden erst nach Hydration sichtbar
- Social Media Crawler (Facebook, Twitter, LinkedIn) führen kein JS aus → leere Previews
- AI-Crawler (GPTBot, PerplexityBot, Claude-Web) sehen keinen Content

### Die Lösung: SSG (Static Site Generation)

Nach dem Build enthält jede HTML-Datei den **vollständig gerenderten Content**:

```html
<html lang="de">
  <head>
    <title>Firmenfeier München | {{BRAND}}</title>
    <meta name="description" content="Planen Sie Ihre Firmenfeier in München...">
    <link rel="canonical" href="{{DOMAIN}}/firmenfeier-muenchen/">
    <link rel="alternate" hreflang="de" href="{{DOMAIN}}/firmenfeier-muenchen/">
    <link rel="alternate" hreflang="en" href="{{DOMAIN}}/en/company-party-munich/">
    <script type="application/ld+json">{"@type":"FAQPage",...}</script>
  </head>
  <body>
    <div id="root">
      <h1>Firmenfeier in München</h1>
      <p>Vollständiger SEO-Content...</p>
      <!-- FAQ-Antworten, Structured Data, alles im HTML -->
    </div>
  </body>
</html>
```

### SEO-Impact von SSG

| Faktor | CSR (ohne SSG) | SSG |
|--------|---------------|-----|
| Googlebot sieht Content | Erst nach JS-Render (Verzögerung) | Sofort |
| Meta-Tags im HTML | Nein (erst nach Hydration) | Ja |
| JSON-LD sichtbar | Nein | Ja |
| hreflang sichtbar | Nein | Ja |
| Social Media Previews | Leer | Vollständig |
| AI-Crawler Content | Leer | Vollständig |
| Indexierung | Tage bis Wochen verzögert | Innerhalb von Stunden |
| Core Web Vitals (LCP) | Schlecht (JS muss laden) | Gut (HTML sofort da) |

### GEO-Optimierung (Generative Engine Optimization)

GEO = Optimierung für AI-gestützte Suchsysteme (Google AI Overviews, ChatGPT Search, Perplexity, etc.).

**Warum SSG für GEO entscheidend ist:**

1. **AI-Crawler führen kein JavaScript aus.** GPTBot, PerplexityBot und Claude-Web fetchen nur das initiale HTML. Ohne SSG sehen sie eine leere Seite.

2. **Strukturierte Daten im HTML** (JSON-LD) ermöglichen AI-Systemen, Fakten direkt zu extrahieren (Adresse, Öffnungszeiten, Preise, FAQ-Antworten).

3. **hreflang im HTML** signalisiert AI-Systemen die richtige Sprachversion.

4. **FAQ-Content im DOM** (via `forceMount`) macht Fragen und Antworten direkt für AI-Systeme verfügbar — auch wenn das Accordion visuell geschlossen ist.

5. **`llms.txt` und `llm-*.html`** (→ Kapitel 9) geben AI-Systemen maschinenlesbare Zusammenfassungen für korrekte Empfehlungen.

### SSG + Hydration = Best of Both Worlds

- **Server-Side:** Vollständiges HTML für Crawler (SEO + GEO)
- **Client-Side:** React übernimmt nach dem Laden für interaktive Features
- **Kein Performance-Nachteil:** Statisches HTML wird blitzschnell ausgeliefert, React hydriert danach

---

## 3. SEO-Komponente & Meta-Tags

### Zweck

Zentrale Komponente die pro Seite Title, Description, Canonical, hreflang, Open Graph, Twitter Cards und Geo-Tags via React Helmet rendert.

### Interface

```tsx
interface SEOProps {
  title?: string;               // Seitentitel → "Title | {{BRAND}}"
  description?: string;         // Meta-Description (max. 160 Zeichen)
  canonical?: string;           // Kanonischer Pfad (z.B. "/events")
  type?: 'website' | 'article' | string;  // OG-Type
  image?: string;               // OG-Image URL
  noIndex?: boolean;            // Für Admin-Seiten
  alternates?: AlternateUrl[];  // Custom hreflang für dynamische Seiten
  noHreflang?: boolean;         // Legal Pages (nur Standardsprache)
}
```

### Kernlogik

```tsx
const SEO = ({ title, description, canonical, noHreflang, alternates, ...props }: SEOProps) => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const baseUrl = '{{DOMAIN}}';

  // Title-Format: "Seitentitel | {{BRAND}}"
  const fullTitle = title ? `${title} | {{BRAND}}` : '{{BRAND}} – Default-Tagline';

  // Trailing Slash erzwingen (konsistent mit .htaccess)
  const ensureTrailingSlash = (p: string) =>
    p === '/' || p.endsWith('/') ? p : `${p}/`;

  // Base-Slug für hreflang extrahieren
  const { baseSlug } = parseLocalizedPath(location.pathname);

  // Canonical URL bauen
  const currentPath = noHreflang
    ? ensureTrailingSlash(canonical || getLocalizedPath(baseSlug, '{{DEFAULT_LANG}}'))
    : ensureTrailingSlash(canonical || getLocalizedPath(baseSlug, language));
  const canonicalUrl = `${baseUrl}${currentPath}`;

  // hreflang für alle Sprachen (außer Legal Pages)
  const hreflangUrls = noHreflang ? [] : alternates
    ? alternates.map(a => ({ ...a, url: a.url.endsWith('/') ? a.url : `${a.url}/` }))
    : SUPPORTED_LANGUAGES.map(lang => ({
        lang,
        url: `${baseUrl}${getLocalizedPath(baseSlug, lang)}`
      }));

  // x-default = Standardsprache
  const xDefaultUrl = `${baseUrl}${getLocalizedPath(baseSlug, '{{DEFAULT_LANG}}')}`;

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* hreflang Tags */}
      {!noHreflang && hreflangUrls.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      {!noHreflang && <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || `${baseUrl}{{OG_IMAGE}}`} />
      <meta property="og:locale" content={ogLocaleMap[language]} />
      <meta property="og:site_name" content="{{BRAND}}" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />

      {/* Geo Tags (Local SEO) */}
      <meta name="geo.region" content="{{GEO_REGION}}" />
      <meta name="geo.placename" content="{{CITY}}" />
      <meta name="geo.position" content="{{LAT}};{{LNG}}" />
      <meta name="ICBM" content="{{LAT}}, {{LNG}}" />

      {/* noindex wenn gewünscht */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};
```

### ogLocaleMap — Anpassbar

```ts
// Nur die Sprachen eintragen, die das Projekt unterstützt:
const ogLocaleMap: Record<string, string> = {
  de: 'de_DE',
  en: 'en_US',
  // fr: 'fr_FR',
  // it: 'it_IT',
  // es: 'es_ES',
};
```

---

## 4. Structured Data / JSON-LD

### Zweck

Schema.org Structured Data für Google Rich Results und AI-Systeme. Wird via React Helmet in den `<head>` injiziert.

### Verfügbare Schemas

| Schema | Wann | Methode |
|--------|------|---------|
| `{{SCHEMA_TYPE}}` | Jede Seite | `<StructuredData type="main" />` via Helmet |
| WebSite | Jede Seite (kombiniert) | Automatisch mit Main-Schema |
| Organization | Jede Seite (kombiniert) | Automatisch mit Main-Schema |
| BreadcrumbList | Seiten mit Breadcrumbs | `<StructuredData type="breadcrumb" breadcrumbs={[...]} />` |
| FAQPage | Seiten mit FAQ | Inline `<script dangerouslySetInnerHTML>` |
| Event / FoodEvent | Event-/Saison-Seiten | `<StructuredData type="event" eventData={...} />` |
| Menu | Speisekarten / Leistungslisten | `<MenuStructuredData menu={...} />` |
| EventVenue | Landing Pages für Locations | Inline `<script dangerouslySetInnerHTML>` |

### Vorlage-Dateien

| Datei | Zweck |
|-------|-------|
| `src/components/StructuredData.tsx` | Zentrale Komponente für Main, Breadcrumb, Event |
| `src/components/MenuStructuredData.tsx` | Spezialisiert für Menu-Schema |

### Haupt-Schema (anpassbar an jeden Business-Typ)

```tsx
const mainSchema = {
  '@context': 'https://schema.org',
  '@type': '{{SCHEMA_TYPE}}',              // Restaurant, EventVenue, LocalBusiness, etc.
  '@id': '{{DOMAIN}}/#organization',
  name: '{{BRAND}}',
  alternateName: '{{BRAND_SHORT}}',
  description: t.pages.index.description,
  url: '{{DOMAIN}}',
  telephone: '{{PHONE}}',
  email: '{{EMAIL}}',
  priceRange: '{{PRICE_RANGE}}',
  acceptsReservations: true,               // ANPASSEN: true/false
  // servesCuisine: ['Italian', '...'],    // NUR für @type: Restaurant
  address: {
    '@type': 'PostalAddress',
    streetAddress: '{{STREET}}',
    addressLocality: '{{CITY}}',
    postalCode: '{{ZIP}}',
    addressRegion: '{{REGION}}',
    addressCountry: '{{COUNTRY}}',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: {{LAT}},
    longitude: {{LNG}},
  },
  openingHoursSpecification: [
    // ANPASSEN: Eigene Öffnungszeiten
    // {
    //   '@type': 'OpeningHoursSpecification',
    //   dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    //   opens: '11:00',
    //   closes: '23:00'
    // },
    // {
    //   '@type': 'OpeningHoursSpecification',
    //   dayOfWeek: ['Saturday', 'Sunday'],
    //   opens: '10:00',
    //   closes: '24:00'
    // },
  ],
  sameAs: [
    '{{INSTAGRAM}}',
    'https://maps.google.com/?cid={{MAPS_CID}}',
    // Weitere Social-Media-Profile: Facebook, LinkedIn, TripAdvisor, Yelp, etc.
  ],
  founder: [
    // OPTIONAL: Gründer / Inhaber
    // { '@type': 'Person', name: 'Vorname Nachname', jobTitle: 'Geschäftsführer' },
  ],
  amenityFeature: [
    // ANPASSEN: Features/Ausstattung
    // { '@type': 'LocationFeatureSpecification', name: 'Parkplätze', value: true },
    // { '@type': 'LocationFeatureSpecification', name: 'Terrasse', value: true },
    // { '@type': 'LocationFeatureSpecification', name: 'Barrierefreiheit', value: true },
    // { '@type': 'LocationFeatureSpecification', name: 'Klimaanlage', value: true },
    // { '@type': 'LocationFeatureSpecification', name: 'WLAN', value: true },
  ],
  areaServed: [
    { '@type': 'City', name: '{{CITY}}' },
    // Weitere Stadtteile / Regionen
    // { '@type': 'AdministrativeArea', name: 'Maxvorstadt' },
  ],
  potentialAction: [
    // ANPASSEN: Hauptaktion (Reservierung, Buchung, Kontakt)
    // { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: '{{DOMAIN}}/reservierung/' }},
    // { '@type': 'OrderAction', target: { '@type': 'EntryPoint', urlTemplate: '{{DOMAIN}}/bestellen/' }},
  ],
  inLanguage: SUPPORTED_LANGUAGES.map(lang => lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : lang),
};
```

### Breadcrumb Schema

```tsx
<StructuredData type="breadcrumb" breadcrumbs={[
  { name: 'Home', url: '/' },
  { name: 'Events', url: '/events' },
  { name: 'Aktuelle Seite', url: '/events/silvester' }
]} />
```

### FAQ Schema (Inline — NICHT über Helmet)

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.slice(0, 10).map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": { "@type": "Answer", "text": faq.a }
  }))
})}} />
```

> **Regeln:**
> - Max. 10 FAQ-Items pro Seite (Google-Limit)
> - Genau 1× FAQPage pro URL
> - Inline rendern (nicht über Helmet), um Hydration-Duplikate zu vermeiden

### EventVenue Schema (Landing Pages)

Für Seiten die einen Veranstaltungsort / Location bewerben:

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "EventVenue",
  "name": "{{BRAND}}",
  "description": t.seo.pageName.seoDescription,
  "url": "{{DOMAIN}}/slug/",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{STREET}}",
    "addressLocality": "{{CITY}}",
    "postalCode": "{{ZIP}}",
    "addressRegion": "{{REGION}}",
    "addressCountry": "{{COUNTRY}}"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": {{LAT}},
    "longitude": {{LNG}}
  },
  "maximumAttendeeCapacity": 120,         // ANPASSEN
  "amenityFeature": [                     // ANPASSEN
    { "@type": "LocationFeatureSpecification", "name": "Parkplätze", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Barrierefreiheit", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "WLAN", "value": true }
  ]
})}} />
```

### Event / FoodEvent Schema (Saisonale Events)

Für zeitlich begrenzte Events, Aktionen, saisonale Angebote:

```tsx
<StructuredData type="event" eventData={{
  name: t.seo.eventName.heroTitle,
  description: t.seo.eventName.seoDescription,
  startDate: '2026-12-31T19:00:00+01:00',   // ANPASSEN
  endDate: '2027-01-01T02:00:00+01:00',      // ANPASSEN
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  image: '/images/event-hero.webp',           // ANPASSEN
  offers: {
    '@type': 'Offer',
    price: '89.00',                           // ANPASSEN
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    url: '{{DOMAIN}}/slug/',
  },
  performer: {                                // OPTIONAL
    '@type': 'MusicGroup',
    name: 'Live-Band Name',
  },
}} />
```

### Menu Schema (Speisekarten / Leistungslisten)

Für Seiten mit strukturierten Angebotslisten:

```tsx
// Eigene Komponente: MenuStructuredData.tsx
const MenuStructuredData = ({ menu }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": menu.name,
    "description": menu.description,
    "inLanguage": language,
    "hasMenuSection": menu.sections.map(section => ({
      "@type": "MenuSection",
      "name": section.name,
      "hasMenuItem": section.items.map(item => ({
        "@type": "MenuItem",
        "name": item.name,
        "description": item.description,
        "offers": {
          "@type": "Offer",
          "price": item.price,
          "priceCurrency": "EUR"
        }
      }))
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
```

> **Hinweis:** Menu-Schema über Helmet rendern ist hier okay, da es nur 1× pro Seite verwendet wird und keine Hydration-Probleme verursacht (im Gegensatz zu FAQPage).

---

## 5. i18n-URL-Architektur & Routing

### Zweck

Mehrsprachige URLs mit übersetzten Slugs. Die Standardsprache (`{{DEFAULT_LANG}}`) hat keinen URL-Prefix, alle anderen Sprachen bekommen `/{lang}/` als Prefix.

### URL-Schema

| Sprache | Muster | Beispiel |
|---------|--------|----------|
| Standard ({{DEFAULT_LANG}}) | `/{slug}/` | `/veranstaltungen/` |
| Weitere Sprachen | `/{lang}/{slug}/` | `/en/events/` |

### slugs.json — Single Source of Truth

```json
{
  "{{DEFAULT_LANG}}": {
    "home": "",
    "beispiel-seite": "beispiel-seite",
    "kontakt": "kontakt",
    "ueber-uns": "ueber-uns",
    "impressum": "impressum",
    "datenschutz": "datenschutz"
  },
  "en": {
    "home": "",
    "beispiel-seite": "example-page",
    "kontakt": "contact",
    "ueber-uns": "about-us",
    "impressum": "imprint",
    "datenschutz": "privacy-policy"
  },
  "parentSlugs": {
    "{{DEFAULT_LANG}}": "veranstaltungen",
    "en": "events"
  }
}
```

> **Erweiterbar:** Für jede neue Sprache ein weiteres Objekt im gleichen Format hinzufügen.

### Language Type

```ts
// In LanguageContext.tsx — MUSS an die Projektsprachen angepasst werden:
export type Language = "de" | "en";  // Erweitern: "de" | "en" | "fr" | "it" | ...
```

### routes.ts — Hilfsfunktionen

```ts
import slugsData from '@/config/slugs.json';

export const SUPPORTED_LANGUAGES: Language[] = {{LANGUAGES}};
export const DEFAULT_LANGUAGE: Language = "{{DEFAULT_LANG}}";

// Slug → Pfad: getLocalizedPath("kontakt", "en") → "/en/contact/"
export const getLocalizedPath = (baseSlug: string, language: Language): string => {
  const slugs = slugsData[language] || slugsData[DEFAULT_LANGUAGE];
  const localizedSlug = slugs[baseSlug] ?? baseSlug;
  if (language === DEFAULT_LANGUAGE) return localizedSlug ? `/${localizedSlug}/` : "/";
  return localizedSlug ? `/${language}/${localizedSlug}/` : `/${language}/`;
};

// Pfad → Slug: parseLocalizedPath("/en/contact/") → { language: "en", baseSlug: "kontakt" }
export const parseLocalizedPath = (path: string): { language: Language; baseSlug: string } => {
  const cleanPath = path.replace(/^\/|\/$/g, ''); // Slashes entfernen
  const segments = cleanPath.split('/');

  // Sprache aus erstem Segment erkennen
  let language: Language = DEFAULT_LANGUAGE;
  let slugPath = cleanPath;

  if (segments[0] && SUPPORTED_LANGUAGES.includes(segments[0] as Language) && segments[0] !== DEFAULT_LANGUAGE) {
    language = segments[0] as Language;
    slugPath = segments.slice(1).join('/');
  }

  // Reverse-Lookup: Übersetzten Slug → Base-Slug (DE-Key) finden
  const langSlugs = slugsData[language] || slugsData[DEFAULT_LANGUAGE];
  const defaultSlugs = slugsData[DEFAULT_LANGUAGE];

  // Spezialfall: leerer Pfad = Home
  if (!slugPath) return { language, baseSlug: 'home' };

  // Suche den Base-Key dessen übersetzter Wert dem URL-Slug entspricht
  for (const [baseKey, translatedSlug] of Object.entries(langSlugs)) {
    if (translatedSlug === slugPath) {
      return { language, baseSlug: baseKey };
    }
  }

  // Fallback: Slug als Base-Slug verwenden
  return { language, baseSlug: slugPath };
};

// Sprachswitch: gleiche Seite, andere Sprache
export const getLanguageSwitchUrl = (currentPath: string, targetLanguage: Language): string => {
  const { baseSlug } = parseLocalizedPath(currentPath);
  return getLocalizedPath(baseSlug, targetLanguage);
};

// Alle Routen für Prerendering
export const getAllLocalizedRoutes = (): string[] => {
  const routes: string[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const baseSlug of Object.keys(slugsData[DEFAULT_LANGUAGE])) {
      routes.push(getLocalizedPath(baseSlug, lang));
    }
  }
  return routes;
};
```

### LocalizedLink — Automatische URL-Übersetzung

```tsx
// Verwendung: <LocalizedLink to="kontakt">Kontakt</LocalizedLink>
// DE → /kontakt/   EN → /en/contact/
const LocalizedLink = ({ to, children, ...props }) => {
  const { language } = useLanguage();

  // Externe URLs, Hash-Links, mailto:, tel: durchlassen
  if (to.startsWith("http") || to.startsWith("#") || to.startsWith("mailto:") || to.startsWith("tel:")) {
    return <Link to={to} {...props}>{children}</Link>;
  }

  const localizedPath = getLocalizedPath(to, language);
  return <Link to={localizedPath} {...props}>{children}</Link>;
};
```

### LanguageContext — SSR-Safety (KRITISCH)

Spracherkennung folgt einer strikten **Prioritäts-Kaskade**: URL > localStorage > Browser > Default.

```tsx
// Spracherkennung — SSR-safe
const detectLanguage = (): Language => {
  // Server: Kein window → Default-Sprache (verhindert SSR-Crash)
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  // 1. URL prüfen (HÖCHSTE Priorität — URL ist die Wahrheit)
  const pathLang = parseLocalizedPath(window.location.pathname).language;
  if (pathLang) return pathLang;

  // 2. localStorage prüfen (vorherige Auswahl des Users)
  const saved = localStorage.getItem("{{LOCALSTORAGE_KEY}}");
  if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) return saved as Language;

  // 3. Browser-Sprache erkennen (Accept-Language Header)
  const browserLangs = navigator.languages || [navigator.language];
  for (const lang of browserLangs) {
    const code = lang.split("-")[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(code as Language)) return code as Language;
  }

  // 4. Fallback: Default-Sprache
  return DEFAULT_LANGUAGE;
};
```

**Sync-Mechanismus im LanguageContext:**

```tsx
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const location = useLocation();

  // Sprache synchron halten wenn URL sich ändert
  useEffect(() => {
    const { language: urlLang } = parseLocalizedPath(location.pathname);
    if (urlLang && urlLang !== language) {
      setLanguage(urlLang);
      localStorage.setItem("{{LOCALSTORAGE_KEY}}", urlLang);
    }
  }, [location.pathname]);

  // Sprachswitch-Funktion für Language-Selector
  const switchLanguage = (newLang: Language) => {
    if (newLang === language) return;
    const newPath = getLanguageSwitchUrl(location.pathname, newLang);
    localStorage.setItem("{{LOCALSTORAGE_KEY}}", newLang);
    navigate(newPath);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: switchLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};
```

> **Wichtig:** Die `html lang` Attribut-Synchronisation erfolgt über die SEO-Komponente (`<html lang={language} />` via Helmet), NICHT im LanguageContext. So ist es auch im SSG-Build korrekt.

---

## 6. Translation-System

### Zweck

TypeScript-typisierte Übersetzungen für alle Texte inkl. SEO-relevanter Titles, Descriptions und FAQ-Inhalte.

### Struktur

```ts
// de.ts (Hauptdatei — TypeScript leitet alle Typen hieraus ab)
export const de = {
  slugs: { home: "", kontakt: "kontakt", /* ... */ },
  nav: { home: "Home", contact: "Kontakt", /* ... */ },
  pages: {
    index: {
      title: "Startseite",
      description: "Meta-Description für die Startseite (max. 160 Zeichen)",
    },
  },
  seo: {
    seitenName: {
      seoTitle: "Titel für Google (max 60 Zeichen)",
      seoDescription: "Description für Google (max 160 Zeichen)",
      heroTitle: "H1 Überschrift",
      introP1: "Erster SEO-Absatz...",
      introP2: "Zweiter SEO-Absatz...",
      faq1Question: "Frage 1?",
      faq1Answer: "Antwort 1...",
      // ... bis faq8Question/faq8Answer
    },
  },
  footer: { /* ... */ },
  legal: { /* ... */ },
};
```

```ts
// en.ts — MUSS exakt die gleichen Keys haben wie de.ts
export const en: typeof import('./de').de = {
  slugs: { home: "", kontakt: "contact", /* ... */ },
  seo: {
    seitenName: {
      seoTitle: "English title for Google",
      seoDescription: "English description",
      faq1Question: "Question 1?",
      faq1Answer: "Answer 1...",
    },
  },
  // ...
};
```

> **TypeScript-Sicherheit:** Wenn ein Key in `de.ts` existiert aber in einer anderen Sprachdatei fehlt, gibt es einen Build-Fehler.

---

## 7. .htaccess — Server-Konfiguration

### Zweck

Apache-Konfiguration: HTTPS-Redirects, WWW-Canonicalization, Trailing Slashes, Caching, Komprimierung, SPA-Fallback.

### Komplette Struktur

```apache
# UTF-8
AddDefaultCharset UTF-8

# ============================================
# 0. SSG-Fix: Ordner → index.html
# ============================================
# Verhindert 403 wenn ein Ordner statt einer Datei angefragt wird
DirectoryIndex index.html

RewriteEngine On
RewriteBase /

# ============================================
# 1a. Subdomain Redirects (optional)
# ============================================
# newsletter.{{DOMAIN_NAKED}} → www.{{DOMAIN_NAKED}}
# RewriteCond %{HTTP_HOST} ^newsletter\.{{DOMAIN_NAKED}}$ [NC]
# RewriteRule ^ {{DOMAIN}}/ [R=301,L]

# ============================================
# 1b. HTTPS + WWW + Trailing Slash — ein 301-Hop
# ============================================
# Nicht-kanonisch OHNE Slash → https://www. MIT Slash
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} !^/$
RewriteCond %{REQUEST_URI} !/$
RewriteCond %{REQUEST_URI} !\.[a-zA-Z0-9]+$
RewriteRule ^(.*)$ {{DOMAIN}}/$1/ [R=301,L]

# Nicht-kanonisch MIT Slash → https://www.
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^ {{DOMAIN}}%{REQUEST_URI} [R=301,L]

# Bereits https://www. aber ohne Slash → Slash hinzufügen
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} !^/$
RewriteCond %{REQUEST_URI} !/$
RewriteCond %{REQUEST_URI} !\.[a-zA-Z0-9]+$
RewriteRule ^(.*)$ /$1/ [R=301,L]

# ============================================
# 1c. Multi-Language Slug Redirects
# ============================================
# Standard-Sprach-Slugs auf Fremdsprach-Pfaden → korrekte Übersetzung
# Beispiel: /en/veranstaltungen/ → /en/events/
# RewriteRule ^en/veranstaltungen/?$ /en/events/ [R=301,L]
# ... (für jeden übersetzten Slug)

# ============================================
# 1d. Legal Pages — Nur Standardsprache
# ============================================
# Fremdsprachige Legal URLs → Standardsprache
# RewriteRule ^en/imprint/?$ /impressum/ [R=301,L]
# RewriteRule ^en/privacy-policy/?$ /datenschutz/ [R=301,L]

# ============================================
# 1e. Legacy-Redirects (alte URLs)
# ============================================
# Wenn eine vorherige Website andere URLs hatte:
# RewriteRule ^alte-seite/?$ /neue-seite/ [R=301,L]

# ============================================
# 2. Error Documents
# ============================================
ErrorDocument 404 /index.html
ErrorDocument 500 /index.html

# ============================================
# 3. SPA-Routing & SSG Support
# ============================================
# Existierende Dateien direkt ausliefern
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Existierende Ordner direkt ausliefern (→ DirectoryIndex greift)
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Alles andere → SPA-Fallback
RewriteRule ^ index.html [L]

# ============================================
# 4. MIME-Types
# ============================================
<IfModule mod_mime.c>
  AddType application/javascript .js
  AddType text/css .css
  AddType image/webp .webp
  AddType image/svg+xml .svg
  AddType font/woff2 .woff2
  AddType application/xml .xml
  AddType text/plain .txt
</IfModule>

# ============================================
# 5. GZIP-Komprimierung
# ============================================
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# ============================================
# 6. Browser-Caching
# ============================================
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# ============================================
# 7. Sitemap XML korrekt ausliefern
# ============================================
<Files "sitemap.xml">
  ForceType application/xml
  <IfModule mod_headers.c>
    Header set Content-Type "application/xml; charset=UTF-8"
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </IfModule>
</Files>
AddCharset UTF-8 .xml
```

---

## 8. Sitemap-Generierung

### Zweck

Dynamische XML-Sitemap mit allen Seiten + hreflang. Wird bei jedem Build neu generiert.

### Konfiguration

```js
const BASE_URL = "{{DOMAIN}}";
const LANGUAGES = {{LANGUAGES}};
const DEFAULT_LANGUAGE = "{{DEFAULT_LANG}}";
const EXCLUDED_ROUTES = ["admin", "admin/login"];
const LEGAL_ONLY_DEFAULT_LANG = ["impressum", "datenschutz", "cookie-richtlinie"];
```

### Priority-Regeln

| Seitentyp | Priority | changefreq |
|-----------|----------|------------|
| Homepage | 1.0 | daily |
| Hauptseiten (Kernangebot) | 0.9 | weekly |
| Content-Seiten | 0.8 | monthly |
| SEO Landing Pages | 0.7 | monthly |
| Legal Pages | 0.3 | monthly |
| Default | 0.6 | monthly |

### hreflang in Sitemap

```xml
<url>
  <loc>{{DOMAIN}}/veranstaltungen/</loc>
  <lastmod>2026-02-08</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
  <xhtml:link rel="alternate" hreflang="de" href="{{DOMAIN}}/veranstaltungen/" />
  <xhtml:link rel="alternate" hreflang="en" href="{{DOMAIN}}/en/events/" />
  <xhtml:link rel="alternate" hreflang="x-default" href="{{DOMAIN}}/veranstaltungen/" />
</url>
```

### Deduplication (bei dynamischen + statischen Routen)

```js
// Bereits bekannte statische Slugs sammeln
const staticSlugs = new Set(STATIC_ROUTES.map(r => r.slug));

// Dynamische Routen: Überspringen wenn bereits als statisch vorhanden
for (const route of dynamicRoutes) {
  const slug = route.slugs[DEFAULT_LANGUAGE].split('/').pop();
  if (staticSlugs.has(slug)) {
    console.log(`Skipping "${slug}" (already in static routes)`);
    continue;
  }
  // ... URL generieren
}
```

### Generator-Script (generate-sitemap.mjs) — Kernlogik

```js
// scripts/generate-sitemap.mjs
import fs from 'fs';
import path from 'path';
import slugsData from '../src/config/slugs.json' assert { type: 'json' };

const BASE_URL = "{{DOMAIN}}";
const LANGUAGES = ["de", "en"];  // ANPASSEN: {{LANGUAGES}}
const DEFAULT_LANGUAGE = "de";   // ANPASSEN: {{DEFAULT_LANG}}
const EXCLUDED_ROUTES = ["admin", "admin/login"];
const LEGAL_ONLY_DEFAULT_LANG = ["impressum", "datenschutz", "cookie-richtlinie"];

// Saisonale / dynamische Routen (optional, aus Supabase oder hardcoded)
const SEASONAL_ROUTES = [
  // { de: "veranstaltungen/silvester-2026", en: "events/new-years-eve-2026" }
];

// Priority-Zuordnung
const getPriority = (slug) => {
  if (slug === '' || slug === 'home') return { priority: '1.0', changefreq: 'daily' };
  if (['kontakt', 'veranstaltungen', 'events'].includes(slug)) return { priority: '0.9', changefreq: 'weekly' };
  if (['ueber-uns', 'catering'].includes(slug)) return { priority: '0.8', changefreq: 'monthly' };
  if (LEGAL_ONLY_DEFAULT_LANG.includes(slug)) return { priority: '0.3', changefreq: 'monthly' };
  // SEO Landing Pages
  if (slug.includes('-muenchen') || slug.includes('-munich')) return { priority: '0.7', changefreq: 'monthly' };
  return { priority: '0.6', changefreq: 'monthly' };
};

// URL-Pfad bauen
const buildPath = (slug, lang) => {
  if (lang === DEFAULT_LANGUAGE) return slug ? `/${slug}/` : '/';
  return slug ? `/${lang}/${slug}/` : `/${lang}/`;
};

// Sitemap generieren
const urls = [];
const today = new Date().toISOString().split('T')[0];

// Statische Routen aus slugs.json
for (const [baseSlug, deSlug] of Object.entries(slugsData[DEFAULT_LANGUAGE])) {
  if (EXCLUDED_ROUTES.includes(deSlug)) continue;

  const isLegalOnly = LEGAL_ONLY_DEFAULT_LANG.includes(deSlug);
  const { priority, changefreq } = getPriority(deSlug);
  const dePath = buildPath(deSlug, DEFAULT_LANGUAGE);
  const deUrl = `${BASE_URL}${dePath}`;

  // hreflang-Links
  const hreflangLinks = isLegalOnly
    ? [`    <xhtml:link rel="alternate" hreflang="${DEFAULT_LANGUAGE}" href="${deUrl}" />`]
    : LANGUAGES.map(lang => {
        const langSlug = slugsData[lang]?.[baseSlug] ?? deSlug;
        const langPath = buildPath(langSlug, lang);
        return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}${langPath}" />`;
      });

  // x-default immer auf Standardsprache
  hreflangLinks.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />`);

  // URL-Block für Standardsprache
  urls.push(`  <url>
    <loc>${deUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks.join('\n')}
  </url>`);

  // URL-Blöcke für weitere Sprachen (außer Legal Pages)
  if (!isLegalOnly) {
    for (const lang of LANGUAGES.filter(l => l !== DEFAULT_LANGUAGE)) {
      const langSlug = slugsData[lang]?.[baseSlug] ?? deSlug;
      const langPath = buildPath(langSlug, lang);
      const langUrl = `${BASE_URL}${langPath}`;

      urls.push(`  <url>
    <loc>${langUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks.join('\n')}
  </url>`);
    }
  }
}

// XML zusammenbauen
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

fs.writeFileSync(path.resolve('dist/sitemap.xml'), sitemap, 'utf-8');
console.log(`✅ Sitemap generated: ${urls.length} URLs`);
```

> **Erweiterbar:** Für dynamische Routen aus Supabase den `SEASONAL_ROUTES`-Block erweitern oder Supabase zur Build-Zeit abfragen.

---

## 9. robots.txt & AI-Crawler

### Zweck

Steuert welche Bots crawlen dürfen. Erlaubt Suchmaschinen + Social Media + nützliche AI-Bots. Blockiert AI-Training-Bots und SEO-Scraper.

### Struktur

```txt
Sitemap: {{DOMAIN}}/sitemap.xml
LLMs-Txt: {{DOMAIN}}/llms.txt

# ─── ERLAUBT: Suchmaschinen ───
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-News
Allow: /

User-agent: Googlebot-Video
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Ecosia
Allow: /

User-agent: Applebot
Allow: /

User-agent: Yandex
Allow: /

User-agent: Baiduspider
Allow: /

# ─── ERLAUBT: Social Media Previews ───
User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: Slackbot
Allow: /

User-agent: Discordbot
Allow: /

User-agent: Pinterest
Allow: /

# ─── ERLAUBT: Review-Plattformen ───
User-agent: YelpBot
Allow: /

User-agent: TripAdvisorBot
Allow: /

User-agent: OpenTableBot
Allow: /

# ─── ERLAUBT: AI-Assistenten (für Empfehlungen) ───
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: Phind
Allow: /

# ─── BLOCKIERT: AI-Training-Bots ───
User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Anthropic-AI
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: Omgilibot
Disallow: /

User-agent: FacebookBot
Disallow: /

# ─── BLOCKIERT: SEO-Scraper ───
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: BLEXBot
Disallow: /

User-agent: DataForSeoBot
Disallow: /

User-agent: serpstatbot
Disallow: /

# ─── Allgemein ───
User-agent: *
Allow: /
Disallow: /admin
Disallow: /assets/*.js$
Disallow: /assets/*.css$
Disallow: /functions/
```

> **Logik:** `Claude-Web` (= AI-Assistent der Nutzern Empfehlungen gibt) wird erlaubt, `ClaudeBot` und `Anthropic-AI` (= Training-Crawler) werden blockiert. Gleiches Prinzip bei GPTBot (erlaubt) vs. Google-Extended (blockiert).

### LLMs.txt — AI-Crawler-Optimierung (GEO)

Erstelle diese Dateien in `public/`:

| Datei | Zweck |
|-------|-------|
| `llms.txt` | Maschinenlesbare Zusammenfassung für AI-Crawler |
| `llm-de.html` | Strukturierte deutsche Version für AI-Systeme |
| `llm-en.html` | Strukturierte englische Version für AI-Systeme |

**Beispiel `llms.txt`:**

```txt
# {{BRAND}}
> Kurzbeschreibung des Unternehmens in einem Satz.

## Kontakt
- Adresse: {{STREET}}, {{ZIP}} {{CITY}}
- Telefon: {{PHONE}}
- E-Mail: {{EMAIL}}
- Website: {{DOMAIN}}

## Öffnungszeiten
- Mo–Fr: 11:00–23:00
- Sa–So: 10:00–24:00

## Angebot
- Punkt 1
- Punkt 2
- ...

## Sprachen
- Deutsch: {{DOMAIN}}/llm-de.html
- English: {{DOMAIN}}/llm-en.html
```

---

## 10. FAQ-Pattern für SEO

### Zweck

FAQ-Inhalte **müssen auch bei geschlossenem Accordion im DOM sein**, damit Suchmaschinen und AI-Crawler sie indexieren können.

### Pattern: forceMount + data-[state=closed]:hidden

```tsx
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";

// FAQ-Daten aus Translations
const faqs = [
  { q: t.seo.pageName.faq1Question, a: t.seo.pageName.faq1Answer },
  { q: t.seo.pageName.faq2Question, a: t.seo.pageName.faq2Answer },
  // ... bis faq8
];

// Rendering
<Accordion type="single" collapsible className="w-full">
  {faqs.map((faq, i) => (
    <AccordionItem key={i} value={`faq-${i}`}>
      <AccordionTrigger className="text-left font-semibold">
        {faq.q}
      </AccordionTrigger>
      <AccordionContent
        forceMount                                          // KRITISCH: Immer im DOM
        className="text-muted-foreground data-[state=closed]:hidden"  // Visuell versteckt
      >
        {faq.a}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

**Warum?** Ohne `forceMount` rendert shadcn den Content erst bei Klick — Googlebot und AI-Crawler sehen ihn nicht. Mit `forceMount` ist der Text immer im HTML, wird aber via CSS versteckt wenn das Accordion geschlossen ist.

### FAQPage JSON-LD dazu

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.slice(0, 10).map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": { "@type": "Answer", "text": faq.a }
  }))
})}} />
```

> **Regel:** Genau 1× FAQPage pro URL. Max. 10 Items. Inline (nicht über Helmet), um Hydration-Duplikate zu vermeiden.

---

## 11. Bild- & Video-Optimierung

### Zweck

Optimale Ladezeit und Core Web Vitals durch WebP, Lazy Loading und explizite Dimensionen.

### Patterns

| Element | Pattern | Grund |
|---------|---------|-------|
| Hero-Bild | `loading="eager"` | LCP-Optimierung (Largest Contentful Paint) |
| Alle anderen Bilder | `loading="lazy"` | Lazy Loading |
| Alle Bilder | `width` + `height` | CLS-Vermeidung (Cumulative Layout Shift) |
| Format | `.webp` | Optimale Kompression (~30% kleiner als JPEG) |
| Alt-Text | Aus i18n (übersetzt) | SEO + Barrierefreiheit |
| Video (Dekor) | `preload="none"` | Kein Auto-Download |

### Beispiele

```tsx
// Hero (LCP-kritisch — wird sofort geladen)
<img
  src={heroImage}
  alt={t.seo.pageName.heroTitle}
  width={1200}
  height={800}
  loading="eager"
  className="w-full h-full object-cover"
/>

// Reguläres Bild (wird erst beim Scrollen geladen)
<img
  src={contentImage}
  alt={t.images.altDescription}
  width={400}
  height={400}
  loading="lazy"
  className="w-full h-full object-cover"
/>

// Dekor-Video (Footer, Hintergrund)
<video
  src={bgVideo}
  autoPlay muted loop playsInline
  preload="none"
  className="w-full h-full object-cover"
/>
```

---

## 12. Landing-Page-Blueprint

### Zweck

Template für SEO-optimierte Landing Pages. Jede Landing Page folgt diesem Aufbau.

### Sektionen-Aufbau

```
 0. StaticBotContent (versteckter SEO-Content für Bots — optional)
 1. SEO-Komponente (title, description, canonical)
 2. StructuredData (Haupt-Schema + Breadcrumbs)
 3. Inline JSON-LD (FAQPage + optional EventVenue o.ä.)
 4. Header + Navigation
 5. Hero (H1, Subtitle, Badges, CTA) — mit eager-loaded Bild
 6. Intro (2–3 SEO-Absätze mit Keywords)
 7. Pakete / Angebote (Cards)
 8. CTA-Box (Telefon, E-Mail, WhatsApp, Buchung)
 9. Gründe-Grid (6–8 Features)
10. Timeline / Ablauf (Schritte)
11. Extras (Zusatzleistungen)
12. Testimonials (Kundenstimmen)
13. FAQ-Accordion (8 Fragen, forceMount!)
14. Benefits (6 Vorteile)
15. Verwandte Seiten (min. 3 interne Links → LocalizedLink)
16. Google Maps (Consent-basiert, lazy)
17. Final CTA
18. Footer
```

### StaticBotContent — Versteckter SEO-Content (Sektion 0)

Für Seiten deren visuelles Design wenig Text erlaubt, aber Suchmaschinen mehr Content brauchen:

```tsx
// Nur für Bots sichtbar — visuell versteckt, aber im DOM
const StaticBotContent = ({ children }: { children: React.ReactNode }) => (
  <div
    className="sr-only"           // Tailwind: screen-reader only (visually hidden)
    aria-hidden="false"            // Für Accessibility trotzdem lesbar
    data-nosnippet="false"         // Google darf es als Snippet verwenden
  >
    {children}
  </div>
);

// Verwendung in der Landing Page:
<StaticBotContent>
  <h2>{t.seo.pageName.botContentTitle}</h2>
  <p>{t.seo.pageName.botContentP1}</p>
  <p>{t.seo.pageName.botContentP2}</p>
  <ul>
    <li>{t.seo.pageName.botFeature1}</li>
    <li>{t.seo.pageName.botFeature2}</li>
    <li>{t.seo.pageName.botFeature3}</li>
  </ul>
</StaticBotContent>
```

> **Wann verwenden?** Nur wenn das visuelle Design nicht genug Text-Content für SEO hergibt (z.B. sehr bildlastige Hero-Seiten). Bevorzugt sollte SEO-Content immer sichtbar integriert werden — Google wertet sichtbaren Content höher.

### Code-Skeleton

```tsx
const LandingPage = () => {
  const { t, language } = useLanguage();
  usePrerenderReady(true);
  const s = t.seo.seitenName;

  const faqs = [
    { q: s.faq1Question, a: s.faq1Answer },
    // ... 8 FAQs
  ];

  return (
    <>
      {/* ── SEO ── */}
      <SEO title={s.seoTitle} description={s.seoDescription} canonical="/slug" />
      <StructuredData type="main" />
      <StructuredData type="breadcrumb" breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: s.heroTitle, url: '/slug' }
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question", "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      })}} />

      <Header />
      <Navigation />

      {/* ── Hero ── */}
      <section className="relative h-[70vh] overflow-hidden">
        <img src={heroImage} alt={s.heroTitle} width={1920} height={1080}
             loading="eager" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold">{s.heroTitle}</h1>
          <p className="mt-4 text-lg">{s.heroSubtitle}</p>
          <Button asChild className="mt-6">
            <a href={`tel:{{PHONE}}`}>{s.heroCta}</a>
          </Button>
        </div>
      </section>

      {/* ── Intro SEO-Content ── */}
      <section className="py-16 container max-w-4xl">
        <h2>{s.introTitle}</h2>
        <p>{s.introP1}</p>
        <p>{s.introP2}</p>
      </section>

      {/* ── CTA-Box ── */}
      <section className="bg-primary text-primary-foreground py-12 text-center">
        <div className="flex flex-wrap justify-center gap-6">
          <a href={`tel:{{PHONE}}`}><Phone className="inline mr-2" /> Anrufen</a>
          <a href={`mailto:{{EMAIL}}`}><Mail className="inline mr-2" /> E-Mail</a>
          <a href={`https://wa.me/{{WHATSAPP}}`}><MessageCircle className="inline mr-2" /> WhatsApp</a>
        </div>
      </section>

      {/* ── FAQ mit forceMount ── */}
      <section className="py-16 container max-w-3xl">
        <h2 className="text-2xl font-bold mb-8">{s.faqTitle}</h2>
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
              <AccordionContent forceMount className="data-[state=closed]:hidden">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ── Verwandte Seiten (Interne Verlinkung) ── */}
      <section className="py-16 container">
        <h2 className="text-2xl font-bold mb-8">Das könnte Sie auch interessieren</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {relatedLinks.map((link, i) => (
            <LocalizedLink key={i} to={link.to}
              className="border rounded-lg p-6 hover:border-primary transition-colors">
              <h3 className="font-semibold">{link.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{link.desc}</p>
            </LocalizedLink>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};
```

---

## 13. SEO-Operations-System (Monitoring & Alerting)

### Zweck

Automatisiertes SEO-Monitoring: GSC-Daten analysieren, Alerts generieren, Tasks erstellen, Claude-Code-Prompts ausgeben.

### Vorlage-Dateien

| Datei | Zweck |
|-------|-------|
| `supabase/functions/seo-api/index.ts` | REST-API für Dashboard |
| `supabase/functions/seo-pipeline/index.ts` | Alert-Erkennung + Task-Generierung |
| `supabase/functions/seo-crawler/index.ts` | URL-Crawler (Title, Status, etc.) |
| `supabase/functions/gsc-sync/index.ts` | GSC-Daten importieren |
| `supabase/functions/gsc-aggregate/index.ts` | Metriken aggregieren |
| `supabase/migrations/20260206_seo_ops_schema.sql` | Datenbank-Schema |
| `supabase/migrations/20260208_seo_crawler_schema.sql` | Crawler-Schema |
| `supabase/migrations/20260208_seo_cron_jobs.sql` | Cron-Job-Definitionen |
| `src/hooks/useSEOOps.ts` | React Hook für SEO-Dashboard |
| `src/hooks/useSEOCrawler.ts` | React Hook für Crawler-Panel |
| `src/components/admin/seo-ops/SEODashboard.tsx` | Admin UI (60/40 Split-View) |
| `src/components/admin/seo-ops/SEOCrawlerPanel.tsx` | Crawler-Ergebnisse |

### Architektur

```
Cron-Jobs (täglich):
  06:00 gsc-sync       → GSC-Daten holen
  06:10 gsc-aggregate   → Metriken aggregieren
  06:15 seo-pipeline    → Alerts + Tasks + Prompts generieren
  06:30 seo-crawler     → Alle URLs crawlen

API (Supabase Edge Function: seo-api):
  GET /briefing, /alerts, /tasks, /prompts, /stats
  GET /crawl-runs, /crawl-results
  PATCH /alerts/:id, /tasks/:id

Admin UI:
  SEODashboard → SEOBriefingCard, SEOAlertsPanel, SEOTasksPanel,
                  SEOPromptsPanel, SEOCrawlerPanel
```

### Datenbank-Tabellen

| Tabelle | Zweck |
|---------|-------|
| `seo_page_catalog` | Katalog aller Seiten mit Typ + Keywords |
| `seo_alert_rule` | Konfigurierbare Regeln (12+ Stück) |
| `seo_alert_event` | Erkannte Probleme/Chancen |
| `seo_task` | Aufgaben aus Alerts |
| `seo_prompt_pack` | Claude-Code Prompts |
| `seo_daily_briefing` | Tägliche Zusammenfassung |
| `seo_baseline_cache` | Berechnete Normwerte |
| `seo_crawl_run` | Crawl-Durchläufe |
| `seo_crawl_result` | Ergebnisse pro URL |

### Alert-Regeln (vorkonfiguriert)

Die SEO-Pipeline erkennt automatisch Probleme und Chancen anhand dieser Regeln:

| # | Regel | Typ | Schwellwert |
|---|-------|-----|-------------|
| 1 | Ranking-Absturz | `alert` | Position verschlechtert sich um >5 Plätze in 7 Tagen |
| 2 | Ranking-Chance | `opportunity` | Keyword auf Position 11–20 mit >100 Impressions |
| 3 | CTR-Einbruch | `alert` | CTR sinkt um >30% bei gleichbleibender Position |
| 4 | CTR-Underperformer | `opportunity` | CTR unter Durchschnitt für diese Position |
| 5 | Neue Keywords | `info` | Keyword erstmals in Top 50 aufgetaucht |
| 6 | Indexierung verloren | `alert` | Seite war indexiert, jetzt nicht mehr |
| 7 | 404-Fehler | `alert` | Crawler findet 404 auf bekannter URL |
| 8 | Titel/Description fehlt | `alert` | Leerer oder fehlender Title/Description |
| 9 | Duplicate Content | `alert` | Gleicher Title auf mehreren URLs |
| 10 | Langsame Seite | `alert` | Ladezeit >3s im Crawl |
| 11 | hreflang-Fehler | `alert` | hreflang-Referenz zeigt auf 404 |
| 12 | Cannibalization | `opportunity` | Mehrere Seiten ranken für gleiches Keyword |

### API-Endpunkte (seo-api Edge Function)

```
GET  /seo-api/briefing          → Tägliche Zusammenfassung
GET  /seo-api/alerts            → Offene Alerts (filterbar: type, status, severity)
GET  /seo-api/tasks             → Aufgaben aus Alerts
GET  /seo-api/prompts           → Claude-Code Prompts zur Behebung
GET  /seo-api/stats             → Aggregierte Metriken (Clicks, Impressions, Avg. Position)
GET  /seo-api/crawl-runs        → Crawl-Durchläufe
GET  /seo-api/crawl-results     → Ergebnisse pro URL (filterbar: status_code, has_title, etc.)
PATCH /seo-api/alerts/:id       → Alert-Status ändern (acknowledged, resolved, ignored)
PATCH /seo-api/tasks/:id        → Task-Status ändern (open, in_progress, done, skipped)
```

### Konfiguration pro Projekt

```env
GSC_SITE_URL={{GSC_SITE}}
GSC_SERVICE_ACCOUNT_EMAIL=seo-bot@project.iam.gserviceaccount.com
GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
SUPABASE_URL={{SUPABASE_URL}}
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> **Übertragbarkeit:** Schema und Edge Functions sind domain-unabhängig. Die Domain wird aus der Sitemap gelesen. Nur die `.env`-Variablen müssen pro Projekt angepasst werden.

---

## 14. PWA & Web App Manifest

### Zweck

Progressive Web App Metadaten für installierbare App-Erfahrung.

### manifest.json

```json
{
  "name": "{{BRAND}} – Kurzbeschreibung",
  "short_name": "{{BRAND_SHORT}}",
  "description": "Beschreibung des Angebots",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "{{THEME_COLOR}}",
  "background_color": "{{BG_COLOR}}",
  "icons": [
    { "src": "/favicon.png", "sizes": "64x64", "type": "image/png" },
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["business", "lifestyle"],
  "lang": "{{DEFAULT_LANG}}",
  "scope": "/"
}
```

---

## 15. Performance & Core Web Vitals

### Zweck

Optimale Ladezeiten für Google Page Experience Signal.

### Optimierungen

| Optimierung | Implementierung | Wo |
|-------------|----------------|-----|
| Font Preload | `<link rel="preload" as="font">` | `index.html` |
| Code Splitting | `React.lazy()` + dynamic imports | Router |
| GZIP | Apache `mod_deflate` | `.htaccess` |
| Asset Caching | Vite Hash-Filenames + Cache Headers | `.htaccess` |
| Consent-basierte Embeds | Lazy-load Google Maps nach Cookie-Zustimmung | Eigene Komponente |
| React Query Hydration | Dehydrated State vom SSG-Build | `entry-server.tsx` |
| Preconnect | DNS Prefetch für externe Ressourcen | `index.html` |

### index.html Template

```html
<!doctype html>
<html lang="{{DEFAULT_LANG}}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Google Consent Mode v2 (VOR gtag!) -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'wait_for_update': 500
      });
    </script>

    <!-- GA4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{GA4_ID}}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '{{GA4_ID}}');
    </script>

    <!-- Preconnect -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

    <!-- Critical Font Preload (ANPASSEN: eigene Fonts) -->
    <link rel="preload" href="/fonts/YourFont-Regular.woff2" as="font" type="font/woff2" crossorigin />

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="{{THEME_COLOR}}" />

    <!-- LLMs.txt für AI-Crawler (GEO) -->
    <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable content" />
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 16. Checkliste: Neue Seite SEO-ready machen

Für jede neue Seite im Projekt:

```
[ ] 1. SLUG DEFINIEREN
    - Slug in slugs.json für JEDE Sprache eintragen
    - Slug in Router registrieren

[ ] 2. TRANSLATIONS
    - t.seo.pageName in Hauptsprach-Datei anlegen:
      seoTitle, seoDescription, heroTitle, introP1, introP2, faq1–8
    - Gleiche Keys in alle anderen Sprachdateien übersetzen

[ ] 3. KOMPONENTE ERSTELLEN
    - SEO-Komponente mit title + description + canonical
    - StructuredData type="main" (Haupt-Schema)
    - StructuredData type="breadcrumb"
    - H1 im Hero (nur 1× pro Seite!)
    - FAQPage JSON-LD inline (max. 10 Items)
    - FAQ-Accordion mit forceMount + data-[state=closed]:hidden
    - Related Pages (min. 3 interne Links via LocalizedLink)
    - Alle Bilder: WebP, width/height, lazy/eager, übersetzter Alt-Text
    - usePrerenderReady(true) aufrufen

[ ] 4. PRERENDER
    - Route wird automatisch aus slugs.json gelesen
    - npm run build ausführen
    - Prerendered HTML in dist/ prüfen:
      ✓ <title> korrekt?
      ✓ <meta description> vorhanden?
      ✓ <link canonical> korrekt?
      ✓ JSON-LD vorhanden? (FAQPage, Haupt-Schema, Breadcrumb)
      ✓ hreflang für alle Sprachen?
      ✓ H1 im HTML?
      ✓ FAQ-Antworten im HTML (auch geschlossen)?

[ ] 5. SITEMAP
    - Route erscheint automatisch in sitemap.xml
    - Priority und changefreq in generate-sitemap.mjs anpassen

[ ] 6. .HTACCESS
    - Falls alte URL existiert: 301-Redirect eintragen
    - Falls Legal Page: Nur Standardsprache (Redirect für andere)

[ ] 7. VERIFIZIERUNG
    - npm run build → 0 Fehler
    - curl der URL: Title, Description, Canonical korrekt?
    - JSON-LD im HTML vorhanden?
    - hreflang für alle Sprachen?
    - Google Rich Results Test: keine Fehler
    - Mobile-freundlich (Tailwind responsive)

[ ] 8. NACH DEPLOY
    - Google Search Console: URL prüfen → Indexierung beantragen
    - Sitemap in GSC aktualisieren
    - robots.txt erreichbar?
    - llms.txt aktualisieren (falls neue Inhalte)
```

---

## Zusammenfassung: Was bei jedem neuen Projekt angepasst werden muss

| Bereich | Anzupassende Dateien |
|---------|---------------------|
| Domain & Branding | `vite.config.ts`, `SEO.tsx`, `.htaccess`, `robots.txt`, `manifest.json`, `index.html` |
| Sprachen | `LanguageContext.tsx`, `slugs.json`, `routes.ts`, Translations, `generate-sitemap.mjs` |
| Inhalte | Translations (`de.ts`, `en.ts`, ...), Landing Pages, FAQ-Texte |
| NAP-Daten | `StructuredData.tsx`, `llms.txt`, `llm-*.html`, CTA-Boxen |
| Tracking | `index.html` (GA4 ID), `.env` (GSC Credentials) |
| Design | `manifest.json` (Farben), Icons, OG-Image, Fonts |
| Supabase | `.env`, `client.ts`, `client.ssr.ts`, Migrationen |
| Assets | Hero-Bilder, Favicon, PWA-Icons (192px, 512px) |

---

**Version:** 2.1 (Universal — vollständig)
**Letzte Aktualisierung:** 2026-02-09
