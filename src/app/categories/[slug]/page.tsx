import { notFound } from "next/navigation";
import { ProductsGrid } from "@/components/products/products-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { HeroLanding } from "@/components/ui/hero-1";
import { CategorySidebar } from "@/components/categories/category-sidebar";
import { CategorySubcategoryProductSections } from "@/components/categories/category-subcategory-shops";
import { CategoryBestSellerTestimonials } from "@/components/categories/category-best-seller-testimonials";
import type { CategoryCarouselSlide } from "@/components/categories/category-media-carousel";
import { CATEGORY_HERO_VIDEO_SRC } from "@/lib/category-hero-video";
import type { ClothingCategory } from "@/lib/products";
import { buildHeroThemeProps } from "@/lib/hero-theme";
import { PRIMARY_NAV } from "@/lib/navigation";

function encodePublicSrc(src?: string | null) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (!src.startsWith("/")) return src;
  return encodeURI(src);
}

function heroImagesForCategory(category: ClothingCategory) {
  const navName: Record<ClothingCategory, string> = {
    sarees: "SAREE",
    kurtis: "KURTIS",
    blouses: "BLOUSES",
    gowns: "GOWNS",
  };

  const nav = PRIMARY_NAV.find((n) => n.name === navName[category]);
  const candidates = [
    nav?.featuredImageSrc ?? null,
    ...(nav?.items?.map((i) => i.imageSrc ?? null) ?? []),
  ]
    .map(encodePublicSrc)
    .filter(Boolean) as string[];

  // Unique + stable order
  const seen = new Set<string>();
  const unique = candidates.filter((s) => (seen.has(s) ? false : (seen.add(s), true)));

  // Keep it tight so it feels curated.
  return unique.slice(0, 6);
}

function heroPositionsFor(category: ClothingCategory, count: number, override?: string[]) {
  const defaults: Record<ClothingCategory, string> = {
    sarees: "50% 10%",
    blouses: "50% 12%",
    kurtis: "50% 12%",
    // Gowns images often have faces lower; bias upward so the subject stays centered under the title.
    gowns: "50% 22%",
  };

  const base =
    override && override.length
      ? override
      : Array.from({ length: Math.max(1, count) }, () => defaults[category]);

  if (base.length >= count) return base.slice(0, count);
  const last = base[base.length - 1] ?? defaults[category];
  return [...base, ...Array.from({ length: count - base.length }, () => last)];
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
          src: "/stock_images/showcase-1.jpeg",
          alt: "Rich woven silk and festive drape",
          title: "Banarasi silk",
        },
        {
          src: "/stock_images/showcase-2.jpeg",
          alt: "Soft flowing fabric in motion",
          title: "Georgette",
        },
        {
          src: "/stock_images/showcase-3.jpeg",
          alt: "Light sheer layers and delicate texture",
          title: "Organza",
        },
        {
          src: "/stock_images/showcase-4.jpeg",
          alt: "Smooth luminous textile with modern drape",
          title: "Modal silk",
        },
        {
          src: "/stock_images/showcase-5.jpeg",
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
          src: "/stock_images/showcase-6.jpeg",
          alt: "Statement evening blouse with detail",
          title: "Party wear",
        },
        {
          src: "/stock_images/showcase-7.jpeg",
          alt: "Easy breathable cotton top",
          title: "Cotton",
        },
        {
          src: "/stock_images/showcase-8.jpeg",
          alt: "Lustrous silk blouse styling",
          title: "Silk",
        },
        {
          src: "/stock_images/showcase-9.jpeg",
          alt: "Bold block print and artisan color",
          title: "Ajrakh & artisan",
        },
      ],
    },
  },
  kurtis: {
    title: "Kurtis",
    subtitle: "Work-ready, festive, and easy everyday styles.",
    heroImagePositions: ["50% 12%", "50% 10%", "50% 10%", "50% 10%"],
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
          src: "/stock_images/showcase-1.jpeg",
          alt: "Everyday cotton kurta silhouette",
          title: "Cotton",
        },
        {
          src: "/stock_images/showcase-2.jpeg",
          alt: "Fluid rayon drape and movement",
          title: "Rayon",
        },
        {
          src: "/stock_images/showcase-3.jpeg",
          alt: "Light georgette layers",
          title: "Georgette",
        },
        {
          src: "/stock_images/showcase-4.jpeg",
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
          src: "/stock_images/showcase-5.jpeg",
          alt: "Evening gown with dramatic light",
          title: "Party wear",
        },
        {
          src: "/stock_images/showcase-6.jpeg",
          alt: "Relaxed dress for day events",
          title: "Casual wear",
        },
        {
          src: "/stock_images/showcase-7.jpeg",
          alt: "Airy layered formal look",
          title: "Light & layered",
        },
        {
          src: "/stock_images/showcase-8.jpeg",
          alt: "Longline silhouette on the runway",
          title: "Fluid silhouettes",
        },
        {
          src: "/stock_images/showcase-9.jpeg",
          alt: "High-impact evening styling",
          title: "Statement evenings",
        },
      ],
    },
  },
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cfg = CATEGORY_CONFIG[slug];
  if (!cfg) notFound();

  const category = slug as ClothingCategory;
  const heroImages = heroImagesForCategory(category);
  const heroPositions = heroPositionsFor(category, heroImages.length, cfg.heroImagePositions);

  return (
    <main className="surface-texture">
      <HeroLanding
        {...buildHeroThemeProps({
          title: cfg.title,
          description: cfg.subtitle,
          callToActions: [
            { text: "SHOP NOW", href: "#all-products", variant: "primary" },
            { text: "Explore styles", href: "#shop-by-type", variant: "secondary" },
          ],
        })}
        backgroundImages={heroImages}
        backgroundImagePositions={heroPositions}
        navigation={[{ name: "Home", href: "/" }, ...PRIMARY_NAV]}
        className="min-h-[56svh] sm:min-h-[52svh]"
      />

      {/* No ScrollRevealGroup here: fade-in starts at opacity 0 and can block hero video autoplay in every category. */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:pb-12">
        <CategoryBestSellerTestimonials category={category} categoryTitle={cfg.title} limit={6} />
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div>
            <CategorySidebar category={category} />
          </div>
          <div>
            <ScrollReveal delay={0.06} y={26} variant="fade-up" duration={0.66} className="mt-6 sm:mt-8">
              <div id="all-products">
                <ProductsGrid
                  title={`All ${cfg.title}`}
                  subtitle="Everything in this category from the Creator dashboard — use the sections below to jump by fabric or style."
                  category={category}
                  limit={12}
                  variant="gallery"
                />
              </div>
            </ScrollReveal>

            <section className="mt-10 grid gap-4 rounded-3xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur sm:grid-cols-3 sm:p-8">
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

            <CategorySubcategoryProductSections category={category} />
          </div>
        </div>
      </div>
    </main>
  );
}
