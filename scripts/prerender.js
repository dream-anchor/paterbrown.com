/**
 * Pre-Render Script für SSG
 * Rendert die öffentlichen Seiten zu statischem HTML.
 * Ausführung: node scripts/prerender.js (nach vite build + vite build --ssr)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

// SSR-Build laden
const { render } = await import(
  path.resolve(distDir, "server/entry-server.js")
);

// Client-Build index.html als Template
const template = fs.readFileSync(path.resolve(distDir, "index.html"), "utf-8");

const routes = [
  "/",
  "/impressum",
  "/datenschutz",
  "/newsletter-gesendet",
  "/danke-newsletter",
  "/danke-ticket",
  "/termine",
  "/live-hoerspiel",
  "/pater-brown",
  "/muenchen",
  "/hamburg",
  "/koeln",
  "/berlin",
  "/bremen",
  "/wanja-mues",
  "/antoine-monot",
  "/marvelin",
  "/stefanie-sick",
  "/hoerspiel",
  "/g-k-chesterton",
  "/father-brown",
  "/krimi-hoerspiel",
  "/leipzig",
  "/stuttgart",
  "/zuerich",
  "/baunatal-kassel",
  "/giessen",
  "/kempten",
  "/erding",
  "/neu-isenburg",
];

console.log("Pre-Rendering gestartet...\n");

for (const route of routes) {
  const { html, helmet, dehydratedState } = await render(route);

  let page = template;

  // Template-Title und Meta-Description durch Helmet-Werte ersetzen (keine Duplikate)
  const helmetTitle = helmet?.title?.toString();
  if (helmetTitle) {
    page = page.replace(/<title>[^<]*<\/title>/, helmetTitle);
  }

  // Template-Meta-Description durch Helmet-Meta ersetzen
  const helmetMeta = helmet?.meta?.toString();
  if (helmetMeta) {
    // Original description entfernen (Helmet liefert die richtige)
    page = page.replace(/<meta name="description"[^>]*>/, "");
    // Original robots entfernen
    page = page.replace(/<meta name="robots"[^>]*>/, "");
    // Original keywords entfernen
    page = page.replace(/<meta name="keywords"[^>]*>/, "");
  }

  // Template OG-Tags durch Helmet-OG-Tags ersetzen
  if (helmetMeta) {
    // Alle OG-Tags aus Template entfernen (Helmet hat die richtigen)
    page = page.replace(/<meta property="og:[^>]*>\n?/g, "");
    // Alle Twitter-Tags aus Template entfernen
    page = page.replace(/<meta name="twitter:[^>]*>\n?/g, "");
  }

  // Template canonical durch Helmet ersetzen
  const helmetLink = helmet?.link?.toString();
  if (helmetLink) {
    page = page.replace(/<link rel="canonical"[^>]*>/, "");
  }

  // Helmet-Tags in <head> injizieren (vor </head>)
  const headTags = [
    helmetMeta,
    helmetLink,
    helmet?.script?.toString(),
  ]
    .filter(Boolean)
    .join("\n    ");

  if (headTags) {
    page = page.replace("</head>", `    ${headTags}\n  </head>`);
  }

  // Pre-rendered HTML in #root injizieren
  page = page.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`
  );

  // Dehydrated React Query State für Client-Hydration
  if (dehydratedState?.queries?.length > 0) {
    const stateScript = `<script>window.__REACT_QUERY_STATE__=${JSON.stringify(dehydratedState)}</script>`;
    page = page.replace("</head>", `    ${stateScript}\n  </head>`);
  }

  // Datei schreiben
  const filePath =
    route === "/"
      ? path.resolve(distDir, "index.html")
      : path.resolve(distDir, `${route.slice(1)}/index.html`);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, page);
  console.log(`  ✓ ${route} → ${path.relative(distDir, filePath)}`);
}

console.log(`\n${routes.length} Seiten pre-gerendert.`);

// Sauberer Exit — verhindert dass async Supabase-Cleanup den Prozess crasht
process.exit(0);
