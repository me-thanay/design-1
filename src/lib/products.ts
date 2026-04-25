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
    const cleaned = withMeta[5]?.trim();
    return cleaned ? cleaned : null;
  }
  const match = description.match(
    /^__category__:(sarees|kurtis|blouses|gowns)__([\s\S]*)$/i,
  );
  if (!match) return description;
  const cleaned = match[2]?.trim();
  return cleaned ? cleaned : null;
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

  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? "Item"),
    description: stripMeta(rawDescription),
    price: finalPrice,
    originalPrice,
    discountPercent,
    image: (raw?.image_url as string | null) ?? null,
    inStock: raw?.in_stock !== false,
    category,
    subcategory,
    rating,
  };
}

