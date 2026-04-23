import type { HeroLandingProps } from "@/components/ui/hero-1";
import { SITE_BRAND_NAME, SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";
import { PRIMARY_NAV } from "@/lib/navigation";

export const HERO_THEME_BACKGROUND_IMAGES = [
  // Curated local set (no spaces → reliable on Vercel/Linux).
  "/stock_images/showcase-1.jpeg",
  "/stock_images/showcase-2.jpeg",
  "/stock_images/showcase-3.jpeg",
  "/stock_images/showcase-4.jpeg",
  "/stock_images/showcase-5.jpeg",
  "/stock_images/showcase-6.jpeg",
  "/stock_images/showcase-7.jpeg",
];

export const HERO_THEME_IMAGE_POSITIONS = [
  // Bias upward so faces/subjects stay in frame behind the headline.
  "50% 18%",
  "50% 18%",
  "50% 18%",
  "50% 18%",
  "50% 18%",
  "50% 18%",
  "50% 18%",
];

export const HERO_THEME_IMAGE_POSITIONS_MOBILE = [
  // These images are right-weighted; on mobile cover we keep faces/outfits in frame.
  "72% 22%",
  "72% 22%",
  "68% 24%",
  "66% 24%",
  "66% 24%",
  "64% 18%",
  "70% 22%",
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

