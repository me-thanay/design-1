type FocalRule = {
  /** Matched against encoded + raw URL substrings. */
  test: (src: string) => boolean;
  desktop: string;
  mobile: string;
};

function includesAny(src: string, needles: string[]) {
  const lower = src.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

const KURTIS_HERO_RULES: FocalRule[] = [
  {
    // Portrait party kurti — head was cropping off; bias upward.
    test: (src) => includesAny(src, ["whatsapp image 2026-04-22 at 10.40.13", "10.40.13%20pm"]),
    desktop: "50% 11%",
    mobile: "48% 9%",
  },
  {
    // Landscape — model on the right; shift crop left so text clears the subject.
    test: (src) => src.includes("pexels-dhanno-28949643"),
    desktop: "38% 22%",
    mobile: "42% 18%",
  },
  {
    // Landscape — model on the left, cream printed kurti.
    test: (src) => src.includes("pexels-dhanno-28949655"),
    desktop: "28% 24%",
    mobile: "32% 18%",
  },
  {
    test: (src) => includesAny(src, ["partywear-kurti", "party wear kurti"]),
    desktop: "50% 22%",
    mobile: "48% 15%",
  },
  {
    test: (src) => includesAny(src, ["georgette-kurti", "georgette kurti"]),
    desktop: "52% 24%",
    mobile: "50% 16%",
  },
  {
    test: (src) => includesAny(src, ["cotton-kurti", "cotton kurti"]),
    desktop: "50% 28%",
    mobile: "50% 18%",
  },
  {
    test: (src) => includesAny(src, ["rayon-kurti", "rayon kurti", "rayon kurtis"]),
    desktop: "48% 26%",
    mobile: "46% 17%",
  },
];

const GOWNS_HERO_RULES: FocalRule[] = [
  {
    // Portrait party gown — pool backdrop, face + embroidered hem.
    test: (src) => includesAny(src, ["party%20wear%20gown", "party wear gown"]),
    desktop: "50% 17%",
    mobile: "46% 13%",
  },
  {
    // Portrait casual tiered gown — full body, centered.
    test: (src) => includesAny(src, ["casual%20wear%20gown", "casual wear gown"]),
    desktop: "50% 19%",
    mobile: "52% 14%",
  },
];

const KURTIS_FALLBACK = { desktop: "50% 22%", mobile: "50% 16%" };
const GOWNS_FALLBACK = { desktop: "50% 18%", mobile: "50% 14%" };

function focalFromRules(src: string, rules: FocalRule[], fallback: { desktop: string; mobile: string }) {
  const hit = rules.find((r) => r.test(src));
  return hit ? { desktop: hit.desktop, mobile: hit.mobile } : fallback;
}

export function kurtisHeroFocal(src: string) {
  return focalFromRules(src, KURTIS_HERO_RULES, KURTIS_FALLBACK);
}

export function gownsHeroFocal(src: string) {
  return focalFromRules(src, GOWNS_HERO_RULES, GOWNS_FALLBACK);
}

export function heroFocalForCategory(
  category: "kurtis" | "gowns",
  src: string,
  viewport: "desktop" | "mobile",
) {
  const focal = category === "kurtis" ? kurtisHeroFocal(src) : gownsHeroFocal(src);
  return viewport === "mobile" ? focal.mobile : focal.desktop;
}

export function heroFocalListsForCategory(
  category: "kurtis" | "gowns",
  sources: string[],
): { desktop: string[]; mobile: string[] } {
  const resolver = category === "kurtis" ? kurtisHeroFocal : gownsHeroFocal;
  return {
    desktop: sources.map((src) => resolver(src).desktop),
    mobile: sources.map((src) => resolver(src).mobile),
  };
}
