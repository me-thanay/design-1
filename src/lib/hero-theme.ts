import type { HeroLandingProps } from "@/components/ui/hero-1";
import { SITE_BRAND_NAME, SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";
import { PRIMARY_NAV } from "@/lib/navigation";

export const HERO_THEME_BACKGROUND_IMAGES = [
  "/HOME/1.png",
  "/HOME/2.png",
  "/HOME/3.png",
  "/HOME/4.png",
];

export const HERO_THEME_IMAGE_POSITIONS = [
  "50% 18%",
  "50% 18%",
  "50% 18%",
  "50% 18%",
];

export const HERO_THEME_IMAGE_POSITIONS_MOBILE = [
  "50% 22%",
  "50% 22%",
  "50% 22%",
  "50% 22%",
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
    backgroundImagePositionsMobile: HERO_THEME_IMAGE_POSITIONS_MOBILE,
    backgroundImageIntervalMs: 4000,
    backgroundImageFadeMs: 900,
  };
}

