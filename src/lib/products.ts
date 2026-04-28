export type ClothingCategory = "sarees" | "kurtis" | "blouses" | "gowns";

export const CLOTHING_CATEGORIES: ClothingCategory[] = ["sarees", "kurtis", "blouses", "gowns"];

/** Subcategory options — keep in sync with Creator dashboard selects and category page sections. */
export const CLOTHING_SUBCATEGORIES: Record<ClothingCategory, string[]> = {
  sarees: ["banarasi silk", "georgette", "organza", "modal silk", "linen"],
  kurtis: ["cotton", "rayon", "georgette", "party wear"],
  blouses: ["party wear", "cotton", "silk", "ajrakh"],
  gowns: ["party wear", "casual wear"],
};

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
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  if (withMeta) {
    const cleaned = stripImagesMeta(withMeta[5])?.trim();
    return cleaned ? cleaned : null;
  }
  const match = description.match(
    /^__category__:(sarees|kurtis|blouses|gowns)__([\s\S]*)$/i,
  );
  if (!match) return stripImagesMeta(description);
  const cleaned = stripImagesMeta(match[2])?.trim();
  return cleaned ? cleaned : null;
}

const IMAGES_META_MARKER = "__images__:";

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

export function decodeCategory(description: string | null | undefined): ClothingCategory {
  if (!description) return "sarees";
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  if (withMeta) return withMeta[1].toLowerCase() as ClothingCategory;
  const match = description.match(
    /^__category__:(sarees|kurtis|blouses|gowns)__/i,
  );
  if (match) return match[1].toLowerCase() as ClothingCategory;

  const t = description.toLowerCase();
  if (t.includes("saree")) return "sarees";
  if (t.includes("kurti")) return "kurtis";
  if (t.includes("blouse")) return "blouses";
  if (t.includes("gown")) return "gowns";
  return "sarees";
}

export function decodeSubcategory(description: string | null | undefined) {
  if (!description) return null;
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  return withMeta ? withMeta[2].toLowerCase() : null;
}

export function decodeRating(description: string | null | undefined) {
  if (!description) return 4;
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  if (withMeta?.[3]) return normalizeRating(withMeta[3]);
  return 4;
}

export function decodeDiscountPercent(description: string | null | undefined) {
  if (!description) return 0;
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?(?:\|([0-9.]+))?__([\s\S]*)$/i,
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

  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? "Item"),
    description: stripMeta(rawDescription),
    price: finalPrice,
    originalPrice,
    discountPercent,
    images,
    image: (raw?.image_url as string | null) ?? null,
    inStock: raw?.in_stock !== false,
    category,
    subcategory,
    rating,
  };
}

