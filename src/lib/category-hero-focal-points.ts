type FocalRule = {
  /** Matched against encoded + raw URL substrings. */
  test: (src: string) => boolean;
  desktop: string;
  mobile: string;
  /** Zoom > 1 forces side-crop on wide heroes (needed for landscape stock photos). */
  desktopScale?: number;
  mobileScale?: number;
};

export type HeroFocalPoint = {
  desktop: string;
  mobile: string;
  desktopScale: number;
  mobileScale: number;
};

function includesAny(src: string, needles: string[]) {
  const lower = src.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

const KURTIS_HERO_RULES: FocalRule[] = [
  {
    // Portrait party kurti — full body; keep face at top of frame.
    test: (src) => includesAny(src, ["whatsapp image 2026-04-22 at 10.40.13", "10.40.13%20pm"]),
    desktop: "center top",
    mobile: "center top",
    desktopScale: 1,
    mobileScale: 1,
  },
  {
    // Landscape — model on the right; zoom + left bias so title clears the subject.
    test: (src) => src.includes("pexels-dhanno-28949643"),
    desktop: "30% 14%",
    mobile: "72% 12%",
    desktopScale: 1.45,
    mobileScale: 1.12,
  },
  {
    // Landscape — model on the left; zoom keeps the face/outfit left of center text.
    test: (src) => src.includes("pexels-dhanno-28949655"),
    desktop: "42% 16%",
    mobile: "28% 12%",
    desktopScale: 1.4,
    mobileScale: 1.1,
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
    test: (src) => includesAny(src, ["party%20wear%20gown", "party wear gown"]),
    desktop: "50% 17%",
    mobile: "46% 13%",
  },
  {
    test: (src) => includesAny(src, ["casual%20wear%20gown", "casual wear gown"]),
    desktop: "50% 19%",
    mobile: "52% 14%",
  },
];

const KURTIS_FALLBACK: HeroFocalPoint = {
  desktop: "50% 22%",
  mobile: "50% 16%",
  desktopScale: 1,
  mobileScale: 1,
};
const GOWNS_FALLBACK: HeroFocalPoint = {
  desktop: "50% 18%",
  mobile: "50% 14%",
  desktopScale: 1,
  mobileScale: 1,
};

function normalizeFocal(rule: FocalRule): HeroFocalPoint {
  return {
    desktop: rule.desktop,
    mobile: rule.mobile,
    desktopScale: rule.desktopScale ?? 1,
    mobileScale: rule.mobileScale ?? 1,
  };
}

function focalFromRules(src: string, rules: FocalRule[], fallback: HeroFocalPoint): HeroFocalPoint {
  const hit = rules.find((r) => r.test(src));
  return hit ? normalizeFocal(hit) : fallback;
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
): {
  desktop: string[];
  mobile: string[];
  desktopScales: number[];
  mobileScales: number[];
} {
  const resolver = category === "kurtis" ? kurtisHeroFocal : gownsHeroFocal;
  const points = sources.map((src) => resolver(src));
  return {
    desktop: points.map((p) => p.desktop),
    mobile: points.map((p) => p.mobile),
    desktopScales: points.map((p) => p.desktopScale),
    mobileScales: points.map((p) => p.mobileScale),
  };
}
