import type { HeroLandingProps } from "@/components/ui/hero-1";
import { SITE_BRAND_NAME, SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";
import { PRIMARY_NAV } from "@/lib/navigation";

export const HERO_THEME_BACKGROUND_IMAGES = [
  "/hero_imagesss/hero-1.jpeg",
  "/hero_imagesss/hero-2.jpeg",
  "/hero_imagesss/hero-3.jpeg",
  "/hero_imagesss/hero-4.jpeg",
  "/hero_imagesss/hero-5.jpeg",
  "/hero_imagesss/hero-6.jpeg",
  "/hero_imagesss/hero-7.jpeg",
];

export const HERO_THEME_IMAGE_POSITIONS = [
  "center top",
  "50% 6%",
  "50% 18%",
  "50% 5%",
  "50% 8%",
  "50% 6%",
  "50% 10%",
];

export function buildHeroThemeProps(
  overrides: Pick<HeroLandingProps, "title" | "description"> &
    Partial<Pick<HeroLandingProps, "announcementBanner" | "callToActions" | "titleSize">>,
): HeroLandingProps {
  return {
    logo: {
      src: SITE_LOGO_SRC,
      alt: SITE_LOGO_ALT,
      companyName: SITE_BRAND_NAME,
    },
    navigation: PRIMARY_NAV,
    loginText: "Log in",
    loginHref: "/sign-in",
    title: overrides.title,
    description: overrides.description,
    announcementBanner: overrides.announcementBanner,
    callToActions: overrides.callToActions,
    titleSize: overrides.titleSize ?? "large",
    gradientColors: {
      from: "oklch(0.65 0.12 45)",
      to: "oklch(0.5 0.18 264)",
    },
    backgroundImages: HERO_THEME_BACKGROUND_IMAGES,
    backgroundImagePositions: HERO_THEME_IMAGE_POSITIONS,
    backgroundImageIntervalMs: 4000,
    backgroundImageFadeMs: 900,
  };
}

