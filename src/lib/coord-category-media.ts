const COORD_CATEGORY_DIR = "/IMAGES/CoordSet";

const COORD_IMAGE_FILES = {
  casual: "1.png",
  party: "2.png",
  featured: "3.jpeg",
  extra: "4.png",
} as const;

export function coordCategoryImage(file: string) {
  return `${COORD_CATEGORY_DIR}/${encodeURIComponent(file)}`;
}

/** Curated coord-set imagery from `public/IMAGES/CoordSet/`. */
export const COORD_CATEGORY_MEDIA = {
  casual: coordCategoryImage(COORD_IMAGE_FILES.casual),
  party: coordCategoryImage(COORD_IMAGE_FILES.party),
  featured: coordCategoryImage(COORD_IMAGE_FILES.featured),
  hero: [
    coordCategoryImage(COORD_IMAGE_FILES.featured),
    coordCategoryImage(COORD_IMAGE_FILES.casual),
    coordCategoryImage(COORD_IMAGE_FILES.party),
    coordCategoryImage(COORD_IMAGE_FILES.extra),
  ],
} as const;
