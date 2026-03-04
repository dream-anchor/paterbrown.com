/**
 * resize-images.js — Responsive WebP-Varianten generieren
 *
 * Liest Original-Bilder aus public/images/buehne/ und erzeugt
 * responsive Varianten: -300, -480, -768, -1200, -2000
 *
 * Usage: node scripts/resize-images.js
 * Nur fehlende Varianten werden erzeugt (Skip existing).
 */

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const INPUT_DIR = "public/images/buehne";
const WIDTHS = [300, 480, 768, 1200, 2000];
const QUALITY = 80;

// Motive die responsive Varianten bekommen (erkannt am Pattern: name-{width}.webp)
const RESPONSIVE_PATTERN = /^(.+)-(\d+)\.webp$/;

async function main() {
  const files = await readdir(INPUT_DIR);

  // Schritt 1: Alle Motive erkennen (aus existierenden responsive Dateien)
  const motifs = new Map(); // motifName → largest existing width file
  const existingSizes = new Map(); // motifName → Set<width>

  for (const file of files) {
    const match = file.match(RESPONSIVE_PATTERN);
    if (!match) continue;

    const [, motifName, widthStr] = match;
    const width = parseInt(widthStr, 10);
    if (!WIDTHS.includes(width)) continue;

    // Track existing sizes
    if (!existingSizes.has(motifName)) {
      existingSizes.set(motifName, new Set());
    }
    existingSizes.get(motifName).add(width);

    // Track largest file as source
    const current = motifs.get(motifName);
    if (!current || current.width < width) {
      motifs.set(motifName, { width, file });
    }
  }

  console.log(`Gefunden: ${motifs.size} Motive mit responsive Varianten\n`);

  let created = 0;
  let skipped = 0;

  for (const [motifName, source] of motifs) {
    const existing = existingSizes.get(motifName) || new Set();
    const missing = WIDTHS.filter((w) => !existing.has(w));

    if (missing.length === 0) {
      continue;
    }

    const sourcePath = join(INPUT_DIR, source.file);
    const img = sharp(sourcePath);
    const meta = await img.metadata();

    console.log(`${motifName} (Quelle: ${source.file}, ${meta.width}x${meta.height})`);

    for (const width of missing) {
      // Nicht hochskalieren über Quell-Breite hinaus
      if (width > (meta.width || 0)) {
        console.log(`  ⏭  -${width}: übersprungen (Quelle nur ${meta.width}px breit)`);
        skipped++;
        continue;
      }

      const outFile = `${motifName}-${width}.webp`;
      const outPath = join(INPUT_DIR, outFile);

      await sharp(sourcePath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outPath);

      const info = await stat(outPath);
      const kb = (info.size / 1024).toFixed(0);
      console.log(`  ✓  ${outFile} (${kb} KB)`);
      created++;
    }
  }

  console.log(`\nFertig: ${created} Varianten erstellt, ${skipped} übersprungen`);
}

main().catch((err) => {
  console.error("Fehler:", err);
  process.exit(1);
});
