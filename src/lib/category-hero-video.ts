import type { ClothingCategory } from "./products";

/**
 * Category hero spotlight videos (`public/catogarywise_video/`).
 * One entry per `ClothingCategory` so every slug stays wired correctly.
 */
export const CATEGORY_HERO_VIDEO_SRC: Record<ClothingCategory, string> = {
  sarees: "/catogarywise_video/sareee.mp4",
  blouses: "/catogarywise_video/blouse.mp4",
  kurtis: "/catogarywise_video/kurtis.mp4",
  gowns: "/catogarywise_video/gown.mp4",
};
