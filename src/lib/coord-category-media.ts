const COORD_CATEGORY_DIR = "/coor_catogary";

const COORD_IMAGE_FILES = {
  casual: "WhatsApp Image 2026-06-05 at 2.39.35 PM.jpeg",
  party: "WhatsApp Image 2026-06-05 at 2.39.35 PM (1).jpeg",
  featured: "WhatsApp Image 2026-06-05 at 2.39.35 PM (2).jpeg",
} as const;

export function coordCategoryImage(file: string) {
  return `${COORD_CATEGORY_DIR}/${encodeURIComponent(file)}`;
}

/** Curated coord-set imagery from `public/coor_catogary/`. */
export const COORD_CATEGORY_MEDIA = {
  casual: coordCategoryImage(COORD_IMAGE_FILES.casual),
  party: coordCategoryImage(COORD_IMAGE_FILES.party),
  featured: coordCategoryImage(COORD_IMAGE_FILES.featured),
  hero: [
    coordCategoryImage(COORD_IMAGE_FILES.featured),
    coordCategoryImage(COORD_IMAGE_FILES.casual),
    coordCategoryImage(COORD_IMAGE_FILES.party),
  ],
} as const;
