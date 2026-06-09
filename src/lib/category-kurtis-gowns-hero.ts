/**
 * Hero object-position for Kurtis & Gowns category pages only.
 * Each rule matches one real file in `public/` — no global product/grid usage.
 */

type Viewport = "desktop" | "mobile";

function matchSrc(src: string, needles: string[]) {
  const lower = src.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

/** Kurtis hero carousel (3 unique slides from nav). */
export function kurtisHeroObjectPosition(src: string, viewport: Viewport): string {
  if (matchSrc(src, ["whatsapp image 2026-04-22 at 10.40.13", "10.40.13%20pm"])) {
    // Portrait party kurti — face sits high; bias up so heads stay in frame.
    return viewport === "mobile" ? "50% 6%" : "50% 10%";
  }
  if (src.includes("pexels-dhanno-28949643")) {
    // Landscape, model on the right — on mobile crop sides; on desktop crop top/bottom.
    return viewport === "mobile" ? "72% 12%" : "66% 22%";
  }
  if (src.includes("pexels-dhanno-28949655")) {
    // Landscape, model on the left.
    return viewport === "mobile" ? "28% 12%" : "34% 22%";
  }
  return viewport === "mobile" ? "50% 12%" : "50% 18%";
}

/** Gowns hero carousel (party + casual portrait full-body shots). */
export function gownsHeroObjectPosition(src: string, viewport: Viewport): string {
  if (matchSrc(src, ["party%20wear%20gown", "party wear gown"])) {
    // Full-body portrait — keep face + embroidery visible under the title.
    return viewport === "mobile" ? "50% 8%" : "50% 12%";
  }
  if (matchSrc(src, ["casual%20wear%20gown", "casual wear gown"])) {
    return viewport === "mobile" ? "50% 8%" : "50% 10%";
  }
  return viewport === "mobile" ? "50% 10%" : "50% 14%";
}

export function categoryHeroObjectPositions(
  category: "kurtis" | "gowns",
  sources: string[],
  viewport: Viewport,
): string[] {
  const resolver = category === "kurtis" ? kurtisHeroObjectPosition : gownsHeroObjectPosition;
  return sources.map((src) => resolver(src, viewport));
}
