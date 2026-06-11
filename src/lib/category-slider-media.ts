import fs from "fs";
import path from "path";
import type { CategoryCarouselSlide } from "@/components/categories/category-media-carousel";
import { CLOTHING_SUBCATEGORIES, type ClothingCategory } from "./products";

const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

/** Public URL segment + folder under `public/` (matches site spelling). */
const SLIDER_PUBLIC_DIR = "catogary-slider";

/**
 * Disk folder names under `public/catogary-slider/` (your uploads use singular names).
 * URLs use these segments so paths match real folders.
 */
const CATEGORY_DISK_FOLDER: Record<ClothingCategory, string> = {
  sarees: "saree",
  blouses: "blouse",
  kurtis: "kurti",
  gowns: "gown",
};

function diskFolder(category: ClothingCategory): string {
  return CATEGORY_DISK_FOLDER[category];
}

/** Normalize for loose "filename ↔ subcategory" matching. */
function normKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function stemOfFile(name: string): string {
  return name.replace(/\.[^.]+$/i, "");
}

/** Score how well a file stem matches a subcategory label (higher = better). */
function matchScore(stem: string, sub: string): number {
  const st = normKey(stem);
  const subNorm = normKey(sub);
  if (!st || !subNorm) return 0;
  if (st.includes(subNorm) || subNorm.includes(st)) return 100 + subNorm.length;
  const words = sub
    .toLowerCase()
    .split(/\s+/)
    .map((w) => normKey(w))
    .filter((w) => w.length > 1);
  let score = 0;
  for (const w of words) {
    if (st.includes(w)) score += 20 + w.length;
  }
  return score;
}

/** Extra tokens in filenames that map to a subcategory (e.g. typos / generic uploads). */
function synonymBoost(stem: string, sub: string): number {
  const st = normKey(stem);
  const syn: Record<string, string[]> = {
    "banarasi silk": ["banaras", "banarasi", "katan"],
    georgette: ["chiffon"],
    organza: ["organza", "sheer", "net"],
    "modal silk": ["modal", "modalsilk"],
    linen: ["linen", "khadi"],
    "party wear": ["party", "partywear", "evening"],
    "casual wear": ["casual", "day"],
    cotton: ["cotton"],
    rayon: ["rayon"],
    silk: ["silk", "pure"],
    ajrakh: ["ajrakh", "block", "print"],
  };
  const keys = syn[sub.toLowerCase()];
  if (!keys) return 0;
  let bonus = 0;
  for (const k of keys) {
    if (k.length > 2 && st.includes(normKey(k))) bonus += 25;
  }
  return bonus;
}

function scoredMatch(stem: string, sub: string): number {
  return matchScore(stem, sub) + synonymBoost(stem, sub);
}

/** URL-safe path under `/catogary-slider/…` (one encoded segment per part). */
function sliderPublicUrl(diskDir: string, ...segments: string[]): string {
  const parts = [SLIDER_PUBLIC_DIR, diskDir, ...segments].map((p) => encodeURIComponent(p));
  return `/${parts.join("/")}`;
}

/**
 * One slide per subcategory in `CLOTHING_SUBCATEGORIES` order; match files by name.
 * Unmatched subs consume leftover files in sorted order so every type gets an image when possible.
 */
function slidesFromFlatFiles(
  category: ClothingCategory,
  diskDir: string,
  fileNames: string[],
): CategoryCarouselSlide[] {
  const subs = CLOTHING_SUBCATEGORIES[category];
  const unused = new Set(fileNames);
  const assigned = new Map<string, string>();

  for (const sub of subs) {
    let best: { f: string; sc: number } | null = null;
    for (const f of unused) {
      const sc = scoredMatch(stemOfFile(f), sub);
      if (sc > 0 && (!best || sc > best.sc)) best = { f, sc };
    }
    const strongEnough = best && best.sc >= 18;
    if (strongEnough) {
      assigned.set(sub, best!.f);
      unused.delete(best!.f);
    }
  }

  const pool = [...unused].sort((a, b) => a.localeCompare(b));
  for (const sub of subs) {
    if (assigned.has(sub)) continue;
    const next = pool.shift();
    if (next) assigned.set(sub, next);
  }

  const slides: CategoryCarouselSlide[] = [];
  for (const sub of subs) {
    const f = assigned.get(sub);
    if (!f) continue;
    slides.push({
      src: sliderPublicUrl(diskDir, f),
      alt: `${titleCaseLine(sub)} — ${category} collection`,
      title: titleCaseLine(sub),
    });
  }

  for (const f of pool) {
    slides.push({
      src: sliderPublicUrl(diskDir, f),
      alt: `${folderToTitle(stemOfFile(f))} — ${category} collection`,
      title: folderToTitle(stemOfFile(f)),
    });
  }

  return slides;
}

function titleCaseLine(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Align folder names with Creator subcategory strings (spaces vs hyphens). */
function subSlug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function sortSubfolders(dirs: fs.Dirent[], category: ClothingCategory): fs.Dirent[] {
  const order = CLOTHING_SUBCATEGORIES[category].map(subSlug);
  return [...dirs].sort((a, b) => {
    const ia = order.indexOf(subSlug(a.name));
    const ib = order.indexOf(subSlug(b.name));
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return a.name.localeCompare(b.name);
  });
}

function folderToTitle(folderName: string): string {
  const spaced = folderName.replace(/[-_]+/g, " ").trim();
  return titleCaseLine(spaced);
}

/**
 * Build carousel slides from `public/catogary-slider/{saree|blouse|kurti|gown}/`.
 *
 * - **Subfolders:** one slide per folder; uses the first image (alphabetically). Folder names should
 *   match subcategories (`banarasi-silk`, `party wear`, etc.). Titles use the canonical subcategory label when matched.
 * - **Flat files:** matched to subcategories by filename keywords (e.g. `Georgette-saree.jpeg` → Georgette), then any leftovers.
 */
export function getCategoryCarouselSlides(category: ClothingCategory): CategoryCarouselSlide[] | null {
  const diskDir = diskFolder(category);
  const base = path.join(process.cwd(), "public", SLIDER_PUBLIC_DIR, diskDir);
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) {
    return null;
  }

  const entries = fs.readdirSync(base, { withFileTypes: true });
  const subs = CLOTHING_SUBCATEGORIES[category];

  const dirs = sortSubfolders(
    entries.filter((e) => e.isDirectory()),
    category,
  );

  if (dirs.length > 0) {
    const slides: CategoryCarouselSlide[] = [];
    for (const d of dirs) {
      const dirPath = path.join(base, d.name);
      const files = fs
        .readdirSync(dirPath)
        .filter((f) => IMAGE_RE.test(f))
        .sort((a, b) => a.localeCompare(b));
      const file = files[0];
      if (!file) continue;

      const matchedSub = subs.find((s) => subSlug(s) === subSlug(d.name));
      const title = matchedSub ? titleCaseLine(matchedSub) : folderToTitle(d.name);

      slides.push({
        src: sliderPublicUrl(diskDir, d.name, file),
        alt: `${title} — ${category} collection`,
        title,
      });
    }
    return slides.length ? slides : null;
  }

  const files = entries
    .filter((e) => e.isFile() && IMAGE_RE.test(e.name))
    .map((e) => e.name);

  if (files.length === 0) return null;

  const slides = slidesFromFlatFiles(category, diskDir, files);
  return slides.length ? slides : null;
}
