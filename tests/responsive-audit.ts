/**
 * Responsive Audit Script
 * Ausführen: npx tsx tests/responsive-audit.ts
 * Login: TEST_EMAIL=... TEST_PASSWORD=... npx tsx tests/responsive-audit.ts
 */

import { chromium, Browser, Page } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

// ── Konfiguration ──────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const SUPABASE_URL = "https://ymfujbhonvvabivjnnyj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltZnVqYmhvbnZ2YWJpdmpubnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTY5NTgsImV4cCI6MjA3Njc5Mjk1OH0.3koIYLAKW0RqAt9gG-Zvvy2-yImduZAsfI2ZIsTaxAE";

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");

const PUBLIC_ROUTES = ["/", "/impressum", "/datenschutz"];
const PROTECTED_ROUTES = [
  "/admin?tab=calendar",
  "/admin?tab=documents",
  "/admin?tab=picks",
  "/admin?tab=travel",
  "/admin?tab=map",
  "/admin?tab=settings",
];

const VIEWPORTS = [
  { width: 320, height: 812 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

const MIN_TOUCH_TARGET = 44; // px

// ── Types ──────────────────────────────────────────────────────────────────

interface Finding {
  severity: "Critical" | "Major" | "Minor";
  type: string;
  detail: string;
  selector?: string;
  size?: string;
}

interface RouteResult {
  route: string;
  viewportResults: {
    width: number;
    findings: Finding[];
    screenshot: string;
  }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function routeSlug(route: string): string {
  return route.replace(/\//g, "-").replace(/\?tab=/, "-").replace(/^-/, "") || "home";
}

function slugify(route: string, width: number): string {
  return `${routeSlug(route)}-${width}px`;
}

async function waitForNetworkIdle(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {
    // timeout ok, continue
  }
}

// ── Supabase Login ─────────────────────────────────────────────────────────

async function getSupabaseToken(): Promise<string | null> {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.log("⚠️  TEST_EMAIL / TEST_PASSWORD nicht gesetzt — geschützte Routen werden übersprungen.");
    return null;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (error || !data.session) {
    console.error("❌ Supabase Login fehlgeschlagen:", error?.message);
    return null;
  }

  console.log(`✅ Login als ${TEST_EMAIL}`);
  return JSON.stringify(data.session);
}

async function injectSession(page: Page, sessionJson: string) {
  // Supabase speichert Session im localStorage unter dem project-key
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1] ?? "supabase";
  const storageKey = `sb-${projectRef}-auth-token`;
  await page.evaluate(
    ({ key, value }: { key: string; value: string }) => {
      localStorage.setItem(key, value);
    },
    { key: storageKey, value: sessionJson }
  );
}

// ── Audit-Checks ───────────────────────────────────────────────────────────

async function checkHorizontalOverflow(page: Page): Promise<Finding[]> {
  const findings: Finding[] = [];
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  if (hasOverflow) {
    const delta = await page.evaluate(() => {
      return document.documentElement.scrollWidth - window.innerWidth;
    });
    findings.push({
      severity: "Critical",
      type: "Horizontal Overflow",
      detail: `scrollWidth überschreitet innerWidth um ${delta}px`,
    });
  }
  return findings;
}

async function checkTouchTargets(page: Page): Promise<Finding[]> {
  return page.evaluate((minSize: number) => {
    const selectors = ["button", "a", '[role="button"]', "input", "select", "textarea"];
    const findings: Array<{ severity: "Critical" | "Major" | "Minor"; type: string; detail: string; selector?: string; size?: string }> = [];

    selectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return; // hidden
        if (rect.width < minSize || rect.height < minSize) {
          const id = el.id ? `#${el.id}` : "";
          const cls = el.classList.length ? `.${Array.from(el.classList).slice(0, 2).join(".")}` : "";
          const selector = `${el.tagName.toLowerCase()}${id}${cls}`;
          const text = el.textContent?.trim().slice(0, 30) || "";
          findings.push({
            severity: rect.width < 32 || rect.height < 32 ? "Critical" : "Major",
            type: "Touch Target zu klein",
            detail: `"${text}" — ${Math.round(rect.width)}×${Math.round(rect.height)}px (min ${minSize}px)`,
            selector,
            size: `${Math.round(rect.width)}×${Math.round(rect.height)}px`,
          });
        }
      });
    });

    return findings;
  }, MIN_TOUCH_TARGET);
}

async function checkTextOverflow(page: Page): Promise<Finding[]> {
  return page.evaluate(() => {
    const findings: Array<{ severity: "Critical" | "Major" | "Minor"; type: string; detail: string; selector?: string }> = [];
    const all = document.querySelectorAll<HTMLElement>("p, h1, h2, h3, h4, h5, h6, span, li, td, th, label, button, a");
    all.forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 2) {
        const id = el.id ? `#${el.id}` : "";
        const cls = el.classList.length ? `.${Array.from(el.classList).slice(0, 2).join(".")}` : "";
        const selector = `${el.tagName.toLowerCase()}${id}${cls}`;
        const text = el.textContent?.trim().slice(0, 40) || "";
        findings.push({
          severity: "Minor",
          type: "Text-Overflow",
          detail: `"${text}" — scrollWidth ${el.scrollWidth}px > clientWidth ${el.clientWidth}px`,
          selector,
        });
      }
    });
    return findings.slice(0, 10); // max 10 pro Viewport
  });
}

// ── Lighthouse ─────────────────────────────────────────────────────────────

async function runLighthouse(url: string, outputBase: string) {
  return new Promise<void>((resolve) => {
    const slug = url.replace(/https?:\/\/[^/]+/, "").replace(/\//g, "-").replace(/^-/, "") || "home";
    const outFile = path.join(SCREENSHOTS_DIR, `lighthouse-${slug}.json`);

    // lhci is heavy — use lighthouse CLI directly via npx if available
    const cmd = `npx lighthouse "${url}" --output=json --output-path="${outFile}" --preset=mobile --chrome-flags="--headless --no-sandbox" --quiet 2>&1`;
    console.log(`  🔦 Lighthouse: ${url}`);
    exec(cmd, { timeout: 60000 }, (err: Error | null) => {
      if (err) {
        console.log(`  ⚠️  Lighthouse fehlgeschlagen für ${url}: ${err.message.slice(0, 80)}`);
      } else {
        console.log(`  ✅ Lighthouse-Report: ${outFile}`);
      }
      resolve();
    });
  });
}

// ── Report ─────────────────────────────────────────────────────────────────

function generateReport(results: RouteResult[]): string {
  const now = new Date().toLocaleString("de-DE");
  let md = `# Responsive Audit Report\n\n`;
  md += `**Erstellt:** ${now}  \n`;
  md += `**Base URL:** ${BASE_URL}  \n\n`;
  md += `---\n\n`;

  for (const route of results) {
    const allFindings = route.viewportResults.flatMap((v) => v.findings);
    const hasCritical = allFindings.some((f) => f.severity === "Critical");
    const badge = hasCritical ? "🔴" : allFindings.length > 0 ? "🟡" : "🟢";
    md += `## ${badge} \`${route.route}\`\n\n`;

    for (const vr of route.viewportResults) {
      md += `### ${vr.width}px\n\n`;
      md += `Screenshot: \`${path.basename(vr.screenshot)}\`  \n\n`;

      if (vr.findings.length === 0) {
        md += `✅ Keine Findings\n\n`;
      } else {
        md += `| Schweregrad | Typ | Detail | Selector |\n`;
        md += `|---|---|---|---|\n`;
        for (const f of vr.findings) {
          const sev = f.severity === "Critical" ? "🔴 Critical" : f.severity === "Major" ? "🟠 Major" : "🟡 Minor";
          md += `| ${sev} | ${f.type} | ${f.detail} | \`${f.selector || "-"}\` |\n`;
        }
        md += `\n`;
      }
    }
  }

  md += `---\n\n`;
  md += `*Generiert von tests/responsive-audit.ts*\n`;
  return md;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function auditRoute(
  browser: Browser,
  route: string,
  sessionJson: string | null
): Promise<RouteResult> {
  const result: RouteResult = { route, viewportResults: [] };

  for (const viewport of VIEWPORTS) {
    console.log(`  📐 ${viewport.width}px — ${route}`);

    const context = await browser.newContext({
      viewport,
      userAgent:
        viewport.width <= 768
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
          : undefined,
    });
    const page = await context.newPage();

    // Session injizieren für geschützte Routen
    if (sessionJson) {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await injectSession(page, sessionJson);
    }

    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await waitForNetworkIdle(page);

    // Kurze Wartezeit für Animationen
    await page.waitForTimeout(800);

    // Screenshot
    const slug = slugify(route, viewport.width);
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${slug}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Checks
    const findings: Finding[] = [
      ...(await checkHorizontalOverflow(page)),
      ...(await checkTouchTargets(page)),
      ...(await checkTextOverflow(page)),
    ];

    if (findings.length > 0) {
      console.log(`    ⚠️  ${findings.length} Finding(s): ${findings.filter((f) => f.severity === "Critical").length} Critical, ${findings.filter((f) => f.severity === "Major").length} Major`);
    } else {
      console.log(`    ✅ Keine Findings`);
    }

    result.viewportResults.push({
      width: viewport.width,
      findings,
      screenshot: screenshotPath,
    });

    await context.close();
  }

  return result;
}

async function main() {
  console.log("🚀 Responsive Audit startet...\n");

  // Screenshots-Ordner anlegen
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Supabase Login
  const sessionJson = await getSupabaseToken();
  const allResults: RouteResult[] = [];

  const browser = await chromium.launch({ headless: true });

  try {
    // Öffentliche Routen
    console.log("\n📂 Öffentliche Routen:\n");
    for (const route of PUBLIC_ROUTES) {
      const result = await auditRoute(browser, route, null);
      allResults.push(result);
    }

    // Geschützte Routen
    if (sessionJson) {
      console.log("\n🔒 Geschützte Routen:\n");
      for (const route of PROTECTED_ROUTES) {
        const result = await auditRoute(browser, route, sessionJson);
        allResults.push(result);
      }
    }
  } finally {
    await browser.close();
  }

  // Report generieren (vor Lighthouse, damit er auch bei LH-Fehler existiert)
  const report = generateReport(allResults);
  const reportPath = path.join(SCREENSHOTS_DIR, "RESPONSIVE_REPORT.md");
  fs.writeFileSync(reportPath, report, "utf-8");

  const totalFindings = allResults.flatMap((r) => r.viewportResults.flatMap((v) => v.findings));
  const critical = totalFindings.filter((f) => f.severity === "Critical").length;
  const major = totalFindings.filter((f) => f.severity === "Major").length;
  const minor = totalFindings.filter((f) => f.severity === "Minor").length;

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ Audit abgeschlossen`);
  console.log(`   🔴 Critical: ${critical}`);
  console.log(`   🟠 Major:    ${major}`);
  console.log(`   🟡 Minor:    ${minor}`);
  console.log(`   📄 Report:   ${reportPath}`);
  console.log(`   📸 Screenshots: ${SCREENSHOTS_DIR}`);
  console.log(`${"═".repeat(50)}\n`);

  // Lighthouse (nur öffentliche Routen) — optional, nach Report
  console.log("🔦 Lighthouse-Analyse (öffentliche Routen):\n");
  for (const route of PUBLIC_ROUTES) {
    await runLighthouse(`${BASE_URL}${route}`, SCREENSHOTS_DIR);
  }
}

main().catch((err) => {
  console.error("❌ Fehler:", err);
  process.exit(1);
});
