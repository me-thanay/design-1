export type ClothingCategory = "sarees" | "kurtis" | "blouses" | "gowns" | "coord_sets";

export const CLOTHING_CATEGORIES: ClothingCategory[] = [
  "sarees",
  "kurtis",
  "blouses",
  "gowns",
  "coord_sets",
];

/** Subcategory options — keep in sync with Creator dashboard selects and category page sections. */
export const CLOTHING_SUBCATEGORIES: Record<ClothingCategory, string[]> = {
  sarees: ["silk", "georgette", "organza", "linen"],
  kurtis: ["cotton", "rayon", "georgette", "party wear"],
  blouses: ["party wear", "cotton", "silk", "ajrakh"],
  gowns: ["party wear", "casual wear"],
  coord_sets: ["casual wear", "party wear"],
};

const CATEGORY_META_PATTERN =
  "(sarees|kurtis|blouses|gowns|coord_sets)";

export function normalizeSubcategory(category: ClothingCategory, value?: string | null): string {
  const options = CLOTHING_SUBCATEGORIES[category];
  if (!value || !String(value).trim()) return options[0];
  const normalized = String(value).trim().toLowerCase();
  const hit = options.find((s) => s.toLowerCase() === normalized);
  return hit ?? options[0];
}

/** Guess category from what the customer typed in search (navbar / home). */
export function inferCategoryFromSearchQuery(query: string): ClothingCategory | null {
  const s = query.trim().toLowerCase();
  if (!s) return null;
  if (/\bsaree?s?\b/.test(s) || /\bsari(s)?\b/.test(s)) return "sarees";
  if (/\bkurti?s?\b/.test(s) || /\bkurta?s?\b/.test(s) || s.includes("kurthi")) return "kurtis";
  if (/\bblouse?s?\b/.test(s)) return "blouses";
  if (/\bgown?s?\b/.test(s)) return "gowns";
  if (/\bco[-\s]?ord\s*sets?\b/.test(s) || /\bcoord\s*sets?\b/.test(s)) return "coord_sets";
  return null;
}

/** True when the query is only a generic category word (show whole category, no text filter). */
export function isCategoryOnlyQuery(query: string, cat: ClothingCategory): boolean {
  const s = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!s) return false;
  const keywords: Record<ClothingCategory, string[]> = {
    sarees: ["saree", "sarees", "sari", "saris"],
    kurtis: ["kurti", "kurtis", "kurta", "kurtas", "kurthi"],
    blouses: ["blouse", "blouses"],
    gowns: ["gown", "gowns"],
    coord_sets: ["coord set", "coord sets", "coordset", "coordsets", "co-ord set", "co-ord sets"],
  };
  return keywords[cat].includes(s);
}

export type Product = {
  id: string;
  name: string;
  description: string | null;
  /** Final selling price after discount (if any). */
  price: number;
  /** Original price (MRP) before discount. */
  originalPrice: number;
  /** Discount percentage (0-90). */
  discountPercent: number;
  /** All images for the product (first is the primary image). */
  images: string[];
  /** Optional mapping of color -> images for that color. */
  colorImages: Record<string, string[]>;
  /** Available color options (optional). */
  colors: string[];
  /** Available size options (optional). */
  sizes: string[];
  image: string | null;
  inStock: boolean;
  category: ClothingCategory;
  subcategory: string | null;
  rating: number;
};

export function normalizeRating(value?: number | string | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 4;
  return Math.min(5, Math.max(1, Number(n.toFixed(1))));
}

export function stripMeta(description: string | null | undefined) {
  if (!description) return null;
  const withMeta = description.match(
    new RegExp(`^__meta__:${CATEGORY_META_PATTERN}\\|([^|_]+)(?:\\|([0-9.]+))?(?:\\|([0-9.]+))?__([\\s\\S]*)$`, "i"),
  );
  if (withMeta) {
    const cleaned = stripColorImagesMeta(stripVariantsMeta(stripImagesMeta(withMeta[5])))?.trim();
    return cleaned ? cleaned : null;
  }
  const match = description.match(
    new RegExp(`^__category__:${CATEGORY_META_PATTERN}__([\\s\\S]*)$`, "i"),
  );
  if (!match) return stripColorImagesMeta(stripVariantsMeta(stripImagesMeta(description)));
  const cleaned = stripColorImagesMeta(stripVariantsMeta(stripImagesMeta(match[2])))?.trim();
  return cleaned ? cleaned : null;
}

const IMAGES_META_MARKER = "__images__:";
const VARIANTS_META_MARKER = "__variants__:";
const COLOR_IMAGES_META_MARKER = "__color_images__:";

function safeJsonParse(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function appendImagesMeta(
  descriptionWithMeta: string,
  imageUrls: string[] | null | undefined,
) {
  const urls = (imageUrls ?? [])
    .map((u) => String(u || "").trim())
    .filter(Boolean);
  const base = stripImagesMeta(descriptionWithMeta) ?? descriptionWithMeta;
  if (!urls.length) return base;
  // Keep it simple and DB-friendly: store extra images as URL-encoded JSON at the end.
  return `${base}\n${IMAGES_META_MARKER}${encodeURIComponent(
    JSON.stringify(urls),
  )}`;
}

export function decodeImagesMeta(description: string | null | undefined): string[] {
  if (!description) return [];
  const idx = description.lastIndexOf(IMAGES_META_MARKER);
  if (idx === -1) return [];
  const raw = description.slice(idx + IMAGES_META_MARKER.length).trim();
  if (!raw) return [];
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  const parsed = safeJsonParse(decoded);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((u) => String(u || "").trim())
    .filter(Boolean);
}

function stripImagesMeta(description: string | null | undefined) {
  if (!description) return null;
  const idx = description.lastIndexOf(IMAGES_META_MARKER);
  if (idx === -1) return description;
  // Remove marker + everything after it (and a trailing newline).
  const before = description.slice(0, idx);
  return before.replace(/\n$/, "");
}

type VariantsMeta = { colors?: string[]; sizes?: string[] };

function sanitizeList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);
}

function uniqSorted(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function sanitizeColorKey(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function sanitizeColorImagesMap(input: unknown): Record<string, string[]> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const key = sanitizeColorKey(k);
    if (!key) continue;
    const urls = sanitizeList(v);
    if (!urls.length) continue;
    out[key] = urls;
  }
  return out;
}

export function appendColorImagesMeta(
  descriptionWithMeta: string,
  colorImages: Record<string, string[] | null | undefined> | null | undefined,
) {
  // Only strip the color-images marker. Do NOT strip other meta (images/variants),
  // otherwise we'd accidentally erase sizes/colors or multi-image data.
  const base = stripColorImagesMeta(descriptionWithMeta) ?? descriptionWithMeta;
  const mapped = sanitizeColorImagesMap(colorImages ?? {});
  if (!Object.keys(mapped).length) return base;
  return `${base}\n${COLOR_IMAGES_META_MARKER}${encodeURIComponent(JSON.stringify(mapped))}`;
}

export function decodeColorImagesMeta(description: string | null | undefined): Record<string, string[]> {
  if (!description) return {};
  const idx = description.lastIndexOf(COLOR_IMAGES_META_MARKER);
  if (idx === -1) return {};
  const raw = description.slice(idx + COLOR_IMAGES_META_MARKER.length).trim();
  if (!raw) return {};
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  const parsed = safeJsonParse(decoded);
  return sanitizeColorImagesMap(parsed);
}

function stripColorImagesMeta(description: string | null | undefined) {
  if (!description) return null;
  const idx = description.lastIndexOf(COLOR_IMAGES_META_MARKER);
  if (idx === -1) return description;
  const before = description.slice(0, idx);
  return before.replace(/\n$/, "");
}

export function appendVariantsMeta(
  descriptionWithMeta: string,
  variants: VariantsMeta | null | undefined,
) {
  const colors = sanitizeList(variants?.colors);
  const sizes = sanitizeList(variants?.sizes);
  const base = stripVariantsMeta(stripImagesMeta(descriptionWithMeta) ?? descriptionWithMeta) ?? descriptionWithMeta;
  if (!colors.length && !sizes.length) return base;
  const payload = { colors, sizes };
  return `${base}\n${VARIANTS_META_MARKER}${encodeURIComponent(JSON.stringify(payload))}`;
}

export function decodeVariantsMeta(description: string | null | undefined): VariantsMeta {
  if (!description) return {};
  const idx = description.lastIndexOf(VARIANTS_META_MARKER);
  if (idx === -1) return {};
  const raw = description.slice(idx + VARIANTS_META_MARKER.length).trim();
  if (!raw) return {};
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  const parsed = safeJsonParse(decoded);
  if (!parsed || typeof parsed !== "object") return {};
  return {
    colors: sanitizeList((parsed as any).colors),
    sizes: sanitizeList((parsed as any).sizes),
  };
}

function stripVariantsMeta(description: string | null | undefined) {
  if (!description) return null;
  const idx = description.lastIndexOf(VARIANTS_META_MARKER);
  if (idx === -1) return description;
  const before = description.slice(0, idx);
  return before.replace(/\n$/, "");
}

export function decodeCategory(description: string | null | undefined): ClothingCategory {
  if (!description) return "sarees";
  const withMeta = description.match(
    new RegExp(`^__meta__:${CATEGORY_META_PATTERN}\\|([^|_]+)(?:\\|([0-9.]+))?(?:\\|([0-9.]+))?__([\\s\\S]*)$`, "i"),
  );
  if (withMeta) return withMeta[1].toLowerCase() as ClothingCategory;
  const match = description.match(
    new RegExp(`^__category__:${CATEGORY_META_PATTERN}__`, "i"),
  );
  if (match) return match[1].toLowerCase() as ClothingCategory;

  const t = description.toLowerCase();
  if (t.includes("saree")) return "sarees";
  if (t.includes("kurti")) return "kurtis";
  if (t.includes("blouse")) return "blouses";
  if (t.includes("gown")) return "gowns";
  if (t.includes("coord")) return "coord_sets";
  return "sarees";
}

export function decodeSubcategory(description: string | null | undefined) {
  if (!description) return null;
  const withMeta = description.match(
    new RegExp(`^__meta__:${CATEGORY_META_PATTERN}\\|([^|_]+)(?:\\|([0-9.]+))?(?:\\|([0-9.]+))?__([\\s\\S]*)$`, "i"),
  );
  return withMeta ? withMeta[2].toLowerCase() : null;
}

export function decodeRating(description: string | null | undefined) {
  if (!description) return 4;
  const withMeta = description.match(
    new RegExp(`^__meta__:${CATEGORY_META_PATTERN}\\|([^|_]+)(?:\\|([0-9.]+))?(?:\\|([0-9.]+))?__([\\s\\S]*)$`, "i"),
  );
  if (withMeta?.[3]) return normalizeRating(withMeta[3]);
  return 4;
}

export function decodeDiscountPercent(description: string | null | undefined) {
  if (!description) return 0;
  const withMeta = description.match(
    new RegExp(`^__meta__:${CATEGORY_META_PATTERN}\\|([^|_]+)(?:\\|([0-9.]+))?(?:\\|([0-9.]+))?__([\\s\\S]*)$`, "i"),
  );
  const n = Number(withMeta?.[4] ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.min(90, Math.max(0, Number(n.toFixed(1))));
}

export function normalizeProductRow(raw: any): Product {
  const rawDescription: string | null = raw?.description ?? null;
  const category: ClothingCategory =
    raw?.category ?? decodeCategory(rawDescription ?? raw?.name ?? "");
  const subcategory: string | null =
    raw?.subcategory ?? decodeSubcategory(rawDescription);
  const rating = normalizeRating(raw?.rating ?? decodeRating(rawDescription));
  const discountPercent = Math.min(
    90,
    Math.max(
      0,
      Number(
        (raw?.discount_percent ?? raw?.discountPercent ?? decodeDiscountPercent(rawDescription)) ?? 0,
      ) || 0,
    ),
  );
  const originalPrice = Number(raw?.price ?? 0) || 0;
  const discounted = Math.round(originalPrice * (1 - discountPercent / 100));
  const finalPrice = discountPercent > 0 ? Math.max(0, discounted) : originalPrice;

  const rawImageUrls = raw?.image_urls ?? raw?.imageUrls ?? null;
  const imagesFromColumn: string[] = Array.isArray(rawImageUrls)
    ? rawImageUrls
    : typeof rawImageUrls === "string"
      ? (() => {
          const parsed = safeJsonParse(rawImageUrls);
          return Array.isArray(parsed) ? parsed : [];
        })()
      : [];

  const imagesFromMeta = decodeImagesMeta(rawDescription);
  const primary = (raw?.image_url as string | null) ?? null;
  const images = [
    ...imagesFromColumn,
    ...imagesFromMeta,
    ...(primary ? [primary] : []),
  ]
    .map((u) => String(u || "").trim())
    .filter(Boolean)
    // de-dupe while keeping order
    .filter((u, i, arr) => arr.indexOf(u) === i);

  const variantsFromMeta = decodeVariantsMeta(rawDescription);
  let colors = sanitizeList(raw?.colors ?? raw?.color_options ?? variantsFromMeta.colors);
  const sizes = sanitizeList(raw?.sizes ?? raw?.size_options ?? variantsFromMeta.sizes);
  const colorImages = (() => {
    const fromColumn =
      typeof raw?.color_images === "string"
        ? safeJsonParse(raw.color_images)
        : raw?.color_images ?? raw?.colorImages;
    const mapped = sanitizeColorImagesMap(fromColumn);
    return Object.keys(mapped).length ? mapped : decodeColorImagesMeta(rawDescription);
  })();
  if (!colors.length) {
    // If the DB doesn't have a colors column and variants meta is missing,
    // infer colors from colorImages keys so the UI can still show color options.
    colors = uniqSorted(Object.keys(colorImages ?? {}));
  }

  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? "Item"),
    description: stripMeta(rawDescription),
    price: finalPrice,
    originalPrice,
    discountPercent,
    images,
    colorImages,
    colors,
    sizes,
    image: (raw?.image_url as string | null) ?? null,
    inStock: raw?.in_stock !== false,
    category,
    subcategory,
    rating,
  };
}

