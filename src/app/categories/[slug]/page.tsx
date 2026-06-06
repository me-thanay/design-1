import { notFound } from "next/navigation";
import { ProductsGrid } from "@/components/products/products-grid";
import { HeroLanding } from "@/components/ui/hero-1";
import { CategorySidebar } from "@/components/categories/category-sidebar";
import { CategorySubcategoryProductSections } from "@/components/categories/category-subcategory-shops";
import { CategoryBestSellerTestimonials } from "@/components/categories/category-best-seller-testimonials";
import type { CategoryCarouselSlide } from "@/components/categories/category-media-carousel";
import { CATEGORY_HERO_VIDEO_SRC } from "@/lib/category-hero-video";
import type { ClothingCategory } from "@/lib/products";
import { buildHeroThemeProps } from "@/lib/hero-theme";
import { COORD_CATEGORY_MEDIA } from "@/lib/coord-category-media";
import { PRIMARY_NAV } from "@/lib/navigation";
import { publicAssetUrl } from "@/lib/utils";

function encodePublicSrc(src?: string | null) {
  return publicAssetUrl(src) || null;
}

const STOCK_IMAGES_DIR_WITH_SPACE = "/stock images" as const;
const STOCK_IMAGES_FILES = [
  "WhatsApp Image 2026-04-21 at 12.22.48 PM.jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.48 PM (1).jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.48 PM (2).jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.48 PM (3).jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.48 PM (4).jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.48 PM (5).jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.48 PM (6).jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.49 PM.jpeg",
  "WhatsApp Image 2026-04-21 at 12.22.49 PM (1).jpeg",
] as const;

function stockImagesUrl(file: (typeof STOCK_IMAGES_FILES)[number]) {
  // Encode parentheses reliably (encodeURI does not).
  return `/stock%20images/${encodeURIComponent(file)}`;
}

function heroPositionsForCount(count: number) {
  return Array.from({ length: Math.max(1, count) }, () => "50% 50%");
}

const CATEGORY_CONFIG: Record<
  string,
  {
    title: string;
    subtitle: string;
    heroImagePositions?: string[];
    spotlight?: {
      label?: string;
      titleLine1: string;
      titleLine2: string;
      description: string;
      ctaText?: string;
      mediaType?: "image" | "video";
      mediaSrc: string;
      mediaAlt?: string;
      videoPosterSrc?: string;
      indexLabel?: string;
    };
    carousel: {
      eyebrow?: string;
      slides: CategoryCarouselSlide[];
    };
  }
> = {
  sarees: {
    title: "Sarees",
    subtitle: "Silk, cotton, and everyday drapes — curated edits.",
    heroImagePositions: ["50% 10%", "50% 8%", "50% 12%", "50% 10%", "50% 12%"],
    spotlight: {
      label: "Featured",
      titleLine1: "Saree",
      titleLine2: "Edit",
      description:
        "Silks to everyday drapes — handpicked styles that move from work to occasion.",
      ctaText: "Shop",
      mediaType: "video",
      mediaSrc: CATEGORY_HERO_VIDEO_SRC.sarees,
      mediaAlt: "Featured saree video",
      indexLabel: "01",
    },
    carousel: {
      eyebrow: "Shop by type",
      slides: [
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[0]),
          alt: "Rich woven silk and festive drape",
          title: "Banarasi silk",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[1]),
          alt: "Soft flowing fabric in motion",
          title: "Georgette",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[2]),
          alt: "Light sheer layers and delicate texture",
          title: "Organza",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[3]),
          alt: "Smooth luminous textile with modern drape",
          title: "Modal silk",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[4]),
          alt: "Natural matte weave and relaxed fall",
          title: "Linen",
        },
      ],
    },
  },
  blouses: {
    title: "Blouses",
    subtitle: "Tailored fits and premium finishes for every look.",
    heroImagePositions: ["50% 10%", "50% 10%", "50% 10%", "50% 10%"],
    spotlight: {
      label: "Featured",
      titleLine1: "Blouse",
      titleLine2: "Studio",
      description:
        "Premium fits, thoughtful details — pair-ready styles for every saree mood.",
      ctaText: "Shop",
      mediaType: "video",
      mediaSrc: CATEGORY_HERO_VIDEO_SRC.blouses,
      mediaAlt: "Featured blouse video",
      indexLabel: "02",
    },
    carousel: {
      eyebrow: "Shop by type",
      slides: [
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[5]),
          alt: "Statement evening blouse with detail",
          title: "Party wear",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[6]),
          alt: "Easy breathable cotton top",
          title: "Cotton",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[7]),
          alt: "Lustrous silk blouse styling",
          title: "Silk",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[8]),
          alt: "Bold block print and artisan color",
          title: "Ajrakh & artisan",
        },
      ],
    },
  },
  kurtis: {
    title: "Kurtis",
    subtitle: "Work-ready, festive, and easy everyday styles.",
    // Focus lower for the full-length shot so feet don't get cropped in the hero.
    heroImagePositions: ["50% 18%", "50% 28%", "50% 22%", "50% 78%", "50% 18%", "50% 22%"],
    spotlight: {
      label: "Featured",
      titleLine1: "Kurti",
      titleLine2: "Looks",
      description:
        "Easy silhouettes with polished finishing — everyday comfort, elevated.",
      ctaText: "Shop",
      mediaType: "video",
      mediaSrc: CATEGORY_HERO_VIDEO_SRC.kurtis,
      mediaAlt: "Featured kurtis video",
      indexLabel: "03",
    },
    carousel: {
      eyebrow: "Shop by type",
      slides: [
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[0]),
          alt: "Everyday cotton kurta silhouette",
          title: "Cotton",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[1]),
          alt: "Fluid rayon drape and movement",
          title: "Rayon",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[2]),
          alt: "Light georgette layers",
          title: "Georgette",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[3]),
          alt: "Festive embellished kurti look",
          title: "Party wear",
        },
      ],
    },
  },
  gowns: {
    title: "Gowns",
    subtitle: "Party glam and casual comfort — in one edit.",
    heroImagePositions: ["50% 22%", "50% 22%"],
    spotlight: {
      label: "Featured",
      titleLine1: "Gown",
      titleLine2: "Night",
      description:
        "From relaxed to party-ready — statement gowns designed for comfort and glow.",
      ctaText: "Shop",
      mediaType: "video",
      mediaSrc: CATEGORY_HERO_VIDEO_SRC.gowns,
      mediaAlt: "Featured gown video",
      indexLabel: "04",
    },
    carousel: {
      eyebrow: "Shop by type",
      slides: [
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[4]),
          alt: "Evening gown with dramatic light",
          title: "Party wear",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[5]),
          alt: "Relaxed dress for day events",
          title: "Casual wear",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[6]),
          alt: "Airy layered formal look",
          title: "Light & layered",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[7]),
          alt: "Longline silhouette on the runway",
          title: "Fluid silhouettes",
        },
        {
          src: stockImagesUrl(STOCK_IMAGES_FILES[8]),
          alt: "High-impact evening styling",
          title: "Statement evenings",
        },
      ],
    },
  },
  coord_sets: {
    title: "Coord Set",
    subtitle: "Matching tops and bottoms — polished looks with zero effort.",
    heroImagePositions: ["50% 50%", "50% 50%", "50% 50%"],
    spotlight: {
      label: "Featured",
      titleLine1: "Coord",
      titleLine2: "Set",
      description:
        "Effortless matching sets for work, brunch, and evenings — comfortable fabrics with a put-together finish.",
      ctaText: "Shop",
      mediaType: "image",
      mediaSrc: COORD_CATEGORY_MEDIA.featured,
      mediaAlt: "Featured coord set look",
      indexLabel: "05",
    },
    carousel: {
      eyebrow: "Shop by type",
      slides: [
        {
          src: COORD_CATEGORY_MEDIA.casual,
          alt: "Relaxed coord set for easy weekends",
          title: "Casual wear",
        },
        {
          src: COORD_CATEGORY_MEDIA.party,
          alt: "Festive coord set with elevated detail",
          title: "Party wear",
        },
      ],
    },
  },
};

function heroImagesForCategory(category: ClothingCategory): string[] {
  const navName: Record<ClothingCategory, string> = {
    sarees: "SAREE",
    kurtis: "KURTIS",
    blouses: "BLOUSES",
    gowns: "GOWNS",
    coord_sets: "COORD SET",
  };

  const nav = PRIMARY_NAV.find((n) => n.name === navName[category]);
  const cfg = CATEGORY_CONFIG[category];
  const pools: Array<string | null | undefined> = [
    nav?.featuredImageSrc,
    ...(nav?.items?.map((i) => i.imageSrc) ?? []),
    ...(cfg?.carousel.slides.map((slide) => slide.src) ?? []),
  ];

  if (category === "kurtis") {
    pools.push(
      "/kurtis/WhatsApp Image 2026-04-22 at 10.40.13 PM.jpeg",
      "/kurtis/pexels-dhanno-28949643.jpg",
      "/kurtis/pexels-dhanno-28949655.jpg",
    );
  }

  if (category === "coord_sets") {
    pools.push(...COORD_CATEGORY_MEDIA.hero);
  }

  const seen = new Set<string>();
  return pools
    .map(encodePublicSrc)
    .filter((src): src is string => Boolean(src))
    .filter((src) => (seen.has(src) ? false : (seen.add(src), true)))
    .slice(0, 6);
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ sub?: string; color?: string; size?: string }>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const cfg = CATEGORY_CONFIG[slug];
  if (!cfg) notFound();

  const category = slug as ClothingCategory;
  const selectedSubcategory = (sp.sub ?? "").trim() || null;
  const selectedColor = (sp.color ?? "").trim() || null;
  const selectedSize = category === "sarees" ? null : (sp.size ?? "").trim() || null;
  const heroImages = heroImagesForCategory(category);
  const heroPositions = heroPositionsForCount(heroImages.length);

  return (
    <main className="surface-texture">
      <HeroLanding
        {...buildHeroThemeProps({
          title: cfg.title,
          description: cfg.subtitle,
          callToActions: [
            { text: "SHOP NOW", href: "#best-sellers", variant: "primary" },
            { text: "Explore styles", href: "#shop-by-type", variant: "secondary" },
          ],
        })}
        backgroundImages={heroImages}
        backgroundImagePositions={heroPositions}
        backgroundImagePositionsMobile={heroPositions}
        navigation={[{ name: "Home", href: "/" }, ...PRIMARY_NAV]}
        backgroundImageFit="contain"
        backgroundImageFitMobile="contain"
        backgroundImageIntervalMs={4500}
        backgroundImageFadeMs={900}
        minHeightClassName={
          category === "coord_sets"
            ? "min-h-[72svh] sm:min-h-[70svh] lg:min-h-[85svh]"
            : "min-h-[72svh] sm:min-h-[58svh]"
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
        <div className="grid gap-5 lg:gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <CategorySidebar category={category} />
          </div>
          <div>
            <div className="mt-5 sm:mt-8">
              <div id="best-sellers" className="scroll-mt-24">
                <ProductsGrid
                  title={`Best sellers · ${cfg.title}`}
                  subtitle={
                    selectedSubcategory
                      ? `Filtered to “${selectedSubcategory}”.`
                      : "Top-rated pieces in this category — price and rating included."
                  }
                  category={category}
                  subcategory={selectedSubcategory ?? undefined}
                  color={selectedColor ?? undefined}
                  size={selectedSize ?? undefined}
                  limit={12}
                  variant="gallery"
                  sortMode="best"
                />
              </div>
            </div>

            <div className="mt-10 sm:mt-12">
              <div id="all-products" className="scroll-mt-24">
                <ProductsGrid
                  title={`All ${cfg.title}`}
                  subtitle={
                    selectedSubcategory
                      ? `Filtered to “${selectedSubcategory}”.`
                      : "Newest additions from the Creator dashboard — every product shows here."
                  }
                  category={category}
                  subcategory={selectedSubcategory ?? undefined}
                  color={selectedColor ?? undefined}
                  size={selectedSize ?? undefined}
                  limit={24}
                  variant="gallery"
                  sortMode="latest"
                />
              </div>
            </div>

            <section className="mt-8 grid gap-4 rounded-3xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur sm:mt-10 sm:grid-cols-3 sm:p-8">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Fast shipping
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  Dispatch-ready picks and quick support on every order.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Quality fabrics
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  Premium feel, clean finishing, and comfortable fits.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Easy returns
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  Clear policies and smooth exchange/return flow.
                </p>
              </div>
            </section>

            <CategorySubcategoryProductSections
              category={category}
              selectedSubcategory={selectedSubcategory}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
