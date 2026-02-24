# Landingpage Design — paterbrown.com

Dieses Dokument definiert das exakte Design-System für alle Landingpages.
**Die Startseite (Index.tsx) ist die Referenz.** Landingpages verwenden identische CSS-Klassen.

## Grundregeln

1. **Keine eigenen Wrapper-Komponenten** für Styling (kein `Section`, `GhostButton`, `Quote`, `SerifText`)
2. **Direkte `<section>`-Tags** mit exakten Tailwind-Klassen aus der Startseite
3. **DM Sans** für Body-Text (nie Cormorant Garamond / SerifText auf Landingpages)
4. **Josefin Sans** (`font-heading`) für alle Überschriften, Labels, Nav-Links
5. **Kein `card-glow`** bei Bildern (verursacht Chrome GPU-Crash), stattdessen `border border-foreground/10`
6. **Kein `border-radius`** (globaler Radius = 0rem)

## Hero-Section (Immersive Landingpage)

```
section: relative min-h-screen flex items-end justify-center overflow-hidden pb-12 md:pb-16
```

- **Hintergrund:** `<img>` mit `absolute inset-0`, `w-full h-full object-cover object-bottom`
- **Gradient:** Ein Overlay von unten: `bg-gradient-to-t from-background via-background/50 to-transparent`
- **Kein Logo/Ticket im Hero** — Navigation erscheint erst beim Scrollen
- **Kein Breadcrumb** im immersiven Layout

### Hero-Text (unten positioniert)
```
div: relative z-10 text-center px-6 max-w-5xl mx-auto
```

| Element | Klassen |
|---------|---------|
| Label | `neon-gold-subtle text-xs md:text-sm uppercase tracking-[0.4em] mb-6 cinematic-enter` |
| H1 | `text-5xl sm:text-7xl md:text-9xl lg:text-[11rem] font-heading leading-[0.85] tracking-tight uppercase cinematic-enter neon-gold neon-breathe` |
| Subline | `text-lg md:text-xl text-foreground/50 font-light mt-8 tracking-wide cinematic-enter` |
| CTA Button | `text-sm md:text-base uppercase tracking-[0.25em] font-semibold px-10 md:px-14 py-4 md:py-5 border border-foreground/30 hover:border-foreground/60 text-foreground/90 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 backdrop-blur-sm transition-all duration-300` |

### cinematic-enter Delays
- Label: `0.1s`
- H1: `0.2s`
- Subline: `0.4s`
- CTA: `0.6s`

## Navigation (StickyHeader-identisch)

Navigation erscheint erst beim Scrollen (`opacity: 0` → `opacity: 1` ab `scrollY > 60`).

```
header: fixed top-0 left-0 right-0 z-50
        bg-background/95, backdropFilter blur(12px)
        borderBottom: 1px solid hsl(--gold / 0.2)
        boxShadow: 0 4px 20px rgba(0,0,0,0.5)
```

| Element | Klassen |
|---------|---------|
| Container | `w-[92%] max-w-[1400px] mx-auto py-3 md:py-4 flex items-center justify-between` |
| Logo | `h-12 md:h-16 w-auto` |
| Nav Links | `text-base uppercase tracking-[0.2em] font-heading text-foreground/60 hover:text-foreground` |
| Termine (highlight) | `neon-gold text-base uppercase tracking-[0.2em] font-heading` |
| Ticket Button | Bild `tickets-sichern-button.png`, `h-[48px] md:h-[64px] lg:h-[80px] mix-blend-screen` |

## Section-Padding & Container

| Typ | Klassen |
|-----|---------|
| Standard Section | `py-28 md:py-36 px-6` |
| Container schmal | `container mx-auto max-w-5xl` |
| Container mittel | `container mx-auto max-w-6xl` |
| Container weit | `container mx-auto max-w-7xl` |

## Section-Header

```
div: text-center mb-24
```

| Element | Klassen |
|---------|---------|
| Label | `text-gold text-sm uppercase tracking-[0.3em] mb-6 font-medium` |
| H2 (groß) | `text-5xl sm:text-6xl md:text-[8rem] font-heading text-foreground leading-[0.85]` |
| H2 (Cast-Scale) | `text-6xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-heading text-foreground leading-[0.85]` |
| H2 (klein/CTA) | `text-3xl sm:text-4xl md:text-6xl font-heading text-foreground` |

## Body-Text

| Typ | Klassen |
|-----|---------|
| Standard | `text-foreground/70 leading-relaxed text-lg font-light` |
| Konzept (groß) | `text-xl md:text-2xl text-foreground/70 font-light leading-relaxed` |
| Bio/Muted | `text-muted-foreground text-base leading-relaxed` |
| Subtil | `text-foreground/50 leading-relaxed text-sm` |

## Divider

| Typ | Klassen |
|-----|---------|
| Gold-Akzent (kurz) | `h-[1px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent w-24` |
| Zentriert (lang) | `h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent max-w-md mx-auto` |

## Cast-Karten (2-Spalten Grid)

```
Grid:    grid md:grid-cols-2 gap-16 lg:gap-24 max-w-6xl mx-auto
Card:    block group (Link-Wrapper, kein Border, kein Card-Wrapper)
Image:   relative overflow-hidden aspect-[3/4] mb-8
         img: w-full h-full object-cover object-top, filter: grayscale(0.3) contrast(1.1)
Overlay: absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent
Text:    relative z-10 -mt-24 px-4
```

| Element | Klassen |
|---------|---------|
| Name | `text-4xl md:text-6xl font-heading text-foreground mb-2` |
| Rolle | `text-lg text-gold tracking-[0.2em] uppercase font-medium` |
| Bio | `text-muted-foreground mt-4 text-base leading-relaxed max-w-md` |

## Testimonials / Pressestimmen

### Hero-Blockquote (zentriert)
```
blockquote: text-3xl md:text-5xl lg:text-6xl font-heading italic text-foreground/90 leading-tight max-w-4xl mx-auto
```

### Testimonial-Cards (3-Spalten Grid)
```
Grid:  grid md:grid-cols-3 gap-8
Card:  p-8 border border-foreground/10 bg-card/10 space-y-5 transition-colors hover:border-gold/20
```

| Element | Klassen |
|---------|---------|
| Zitat | `text-foreground/80 leading-relaxed text-lg font-light` |
| Citation | `text-gold text-sm not-italic block mt-4 uppercase tracking-wider` |

## Trailer / Video

```
Container: relative overflow-hidden shadow-2xl border border-foreground/10
Desktop:   paddingTop: "56.25%" (16:9)
Mobile:    paddingTop: "177.78%" (9:16), max-w-sm mx-auto
iframe:    absolute top-0 left-0 w-full h-full
```

## Asymmetrische 2-Spalten (Show / Sounddesign)

```
Show:       grid md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center
Sounddesign: grid md:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center (gespiegelt)
```

Bilder: CSS `background-image` statt `<img>` Tag. Container mit `border border-foreground/10 min-h-[300px] md:min-h-[500px] bg-cover bg-center`.
`style={{ backgroundImage: 'url(/images/...)' }}`, `role="img"`, `aria-label="..."`

## Buttons

| Typ | Verwendung |
|-----|-----------|
| `btn-premium` | Gold-Gradient-Button (nach Trailer, nach Testimonials, im CTA-Block) |
| Ghost CTA | `border border-foreground/30 hover:border-foreground/60 ...` (Hero, inline Links) |
| Link-Button | `text-sm md:text-base uppercase tracking-[0.25em] font-semibold px-10 md:px-14 py-4 md:py-5 ...` (Termine-Link) |

## FAQ (nicht aufklappbar)

Fragen + Antworten immer sichtbar, kein Accordion.

```
Container: space-y-3
Card:      border border-foreground/10 px-6 py-5 bg-card/30
Question:  text-foreground font-heading text-base md:text-lg mb-3
Answer:    text-foreground/70 leading-relaxed text-base
```

## Foto-Credits

Credits werden **nicht** bei den Fotos angezeigt, sondern nur im Footer:
`Fotos: © Alexander Frank, Gio Löwe`

## Verbotene Muster

- ❌ `card-glow` bei Bildern (Chrome GPU-Crash)
- ❌ `SerifText` / Cormorant Garamond für Body-Text
- ❌ `GhostButton` Komponente (stattdessen inline Ghost-Button-Klassen)
- ❌ `Section` Wrapper-Komponente
- ❌ `Quote` Wrapper-Komponente
- ❌ `rounded-lg`, `rounded-2xl` etc. (globaler Radius = 0)
- ❌ Breadcrumb im immersiven Layout
- ❌ Logo/Ticket im Hero (Navigation übernimmt beim Scrollen)
