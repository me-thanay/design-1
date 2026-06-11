import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Encode static `/public` paths without double-encoding existing segments. */
export function publicAssetUrl(src?: string | null) {
  if (!src) return src ?? "";
  if (/^https?:\/\//i.test(src)) return src;
  if (!src.startsWith("/")) return src;

  return src
    .split("/")
    .map((segment, index) => {
      if (index === 0 && segment === "") return "";
      if (!segment) return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}
