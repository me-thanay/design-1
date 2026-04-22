import { HeroLanding } from "@/components/ui/hero-1";
import type { HeroLandingProps } from "@/components/ui/hero-1";
import { HomeTrustLogoCloud } from "@/components/home/home-trust-logo-cloud";
import { HomeAboutSawbhagya } from "@/components/home/home-about-sawbhagya";
import { HomeBestSellersSection } from "@/components/home/home-best-sellers-section";
import { HomeTestimonialsMarquee } from "@/components/home/home-testimonials-marquee";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";
import { Footer } from "@/components/ui/footer";
import Slideshow from "@/components/ui/slideshow";
import { Mail, Phone, MapPin } from "lucide-react";
import { ProductsGrid } from "@/components/products/products-grid";
import { ScrollToSearchResults } from "@/components/search/scroll-to-search-results";
import { ScrollReveal, ScrollRevealGroup } from "@/components/motion/scroll-reveal";
import {
  MoodCategoryGrid,
  type MoodCategoryItem,
} from "@/components/home/mood-category-grid";
import {
  inferCategoryFromSearchQuery,
  isCategoryOnlyQuery,
  type ClothingCategory,
} from "@/lib/products";
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";
import { buildHeroThemeProps } from "@/lib/hero-theme";

const heroProps: HeroLandingProps = buildHeroThemeProps({
  title: "Daily essentials. Work-ready styles. Occasion-perfect looks.",
  description:
    "Handcrafted blouses, sarees, and combos — premium fabrics, timeless silhouettes, made for every moment.",
  announcementBanner: {
    text: "GET 10% OFF on prepaid orders.",
    linkText: "Use code PRE10",
    linkHref: "#",
  },
  callToActions: [
    { text: "SHOP NOW", href: "#best-seller", variant: "primary" },
    { text: "Explore collections", href: "#", variant: "secondary" },
  ],
});

const CATEGORY_LABEL: Record<ClothingCategory, string> = {
  sarees: "Sarees",
  kurtis: "Kurtis",
  blouses: "Blouses",
  gowns: "Gowns",
};

const MOOD_CATEGORY_ITEMS: MoodCategoryItem[] = [
  {
    title: "Sarees",
    sub: "Silk · cotton · drape",
    href: "/categories/sarees",
    img: "/shopbymood/sarees.jpeg",
  },
  {
    title: "Blouses",
    sub: "Tailored · premium fit",
    href: "/categories/blouses",
    img: "/shopbymood/blouse.jpeg",
  },
  {
    title: "Kurtis",
    sub: "Everyday · festive",
    href: "/categories/kurtis",
    img: "/shopbymood/kurti.jpeg",
  },
  {
    title: "Gowns",
    sub: "Party · casual",
    href: "/categories/gowns",
    img: "/shopbymood/gown.jpeg",
  },
];

type HomeProps = {
  searchParams: Promise<{ q?: string; cat?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const catParam = (sp.cat ?? "").trim().toLowerCase();
  const validCats: ClothingCategory[] = ["sarees", "kurtis", "blouses", "gowns"];
  const catFromUrl = validCats.includes(catParam as ClothingCategory)
    ? (catParam as ClothingCategory)
    : null;

  const inferred = inferCategoryFromSearchQuery(q);
  const activeCategory = catFromUrl ?? inferred ?? undefined;
  const categoryOnly =
    Boolean(q) && Boolean(activeCategory) && isCategoryOnlyQuery(q, activeCategory as ClothingCategory);
  const effectiveFilter =
    !q ? undefined : categoryOnly ? undefined : q.toLowerCase();

  const showSearchPanel = Boolean(q) || Boolean(catFromUrl);

  let searchTitle: string;
  let searchSubtitle: string;
  if (q) {
    searchTitle = `Results for “${q}”`;
    if (activeCategory) {
      searchSubtitle = categoryOnly
        ? `${CATEGORY_LABEL[activeCategory as ClothingCategory]} — showing the full collection.`
        : `Filtered within ${CATEGORY_LABEL[activeCategory as ClothingCategory]}.`;
    } else {
      searchSubtitle = "Matches across sarees, blouses, kurtis, and gowns.";
    }
  } else if (catFromUrl) {
    searchTitle = `Browse ${CATEGORY_LABEL[catFromUrl]}`;
    searchSubtitle = "Curated picks from this category.";
  } else {
    searchTitle = "";
    searchSubtitle = "";
  }

  return (
    <main>
      <HeroLanding {...heroProps} />
      <HomeTrustLogoCloud />
      <section id="categories" className="surface-texture scroll-mt-24 border-b border-black/5 pb-12 pt-2">
        <div className="mx-auto w-full max-w-6xl px-4">
          <ScrollRevealGroup stagger={0.09} delayChildren={0.02} variant="fade-up" y={24}>
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Categories
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Shop by mood
              </h2>
            </div>
            <MoodCategoryGrid items={MOOD_CATEGORY_ITEMS} />
          </ScrollRevealGroup>
        </div>
      </section>
      {showSearchPanel ? (
        <>
          <ScrollToSearchResults />
          <section
            id="search-results"
            className="surface-texture scroll-mt-24 border-b border-black/5 pb-12 pt-8"
          >
            <div className="mx-auto w-full max-w-6xl px-4">
              <ScrollRevealGroup stagger={0.1} delayChildren={0.03} variant="fade-up" y={22}>
                <div className="mb-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    Shop
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                    {searchTitle}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600">{searchSubtitle}</p>
                </div>
                <ProductsGrid
                  category={activeCategory}
                  filterQuery={effectiveFilter}
                  limit={12}
                  variant="gallery"
                />
              </ScrollRevealGroup>
            </div>
          </section>
        </>
      ) : null}
      <ScrollReveal y={40}>
        <HomeBestSellersSection />
      </ScrollReveal>

      <section className="surface-texture pb-20 pt-2">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="overflow-hidden rounded-3xl bg-transparent px-0 py-10 sm:px-0">
            <ScrollRevealGroup stagger={0.1} delayChildren={0.04} variant="blur" y={20}>
              <div className="mb-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    Showcase
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                    Featured picks in motion
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                    Textures, drapes, and details—hover to pause.
                  </p>
                </div>
              </div>
              <ImageAutoSlider durationSeconds={22} />
            </ScrollRevealGroup>
          </div>
        </div>
      </section>

      <section id="shop" className="surface-texture scroll-mt-24 pb-12 pt-2">
        <div className="mx-auto w-full max-w-6xl px-4">
          <ScrollRevealGroup stagger={0.085} delayChildren={0.02} variant="fade-up" y={26}>
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Shop
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                New arrivals
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Products added from the Creator dashboard — tap to add to cart.
              </p>
            </div>
            <ProductsGrid
              title="Latest picks"
              subtitle="Fresh drops across sarees, blouses, kurtis, and gowns."
              limit={8}
              variant="row"
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <ProductsGrid
                title="Sarees"
                subtitle="Drapes, textures, and festive edits."
                category="sarees"
                limit={6}
              />
              <ProductsGrid
                title="Blouses"
                subtitle="Tailored fits with premium finishing."
                category="blouses"
                limit={6}
              />
            </div>
          </ScrollRevealGroup>
        </div>
      </section>

      <HomeAboutSawbhagya />

      <ScrollReveal y={36}>
        <Slideshow className="surface-texture pb-16 pt-2" />
      </ScrollReveal>

      <HomeTestimonialsMarquee />

      <Footer
        logo={
          <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="h-9 w-9 rounded-sm object-contain" />
        }
        brandName="Sawbhagya"
        socialLinks={[
          { icon: <Mail className="h-5 w-5" />, href: "mailto:hello@sawbhagya.com", label: "Email" },
          { icon: <Phone className="h-5 w-5" />, href: "tel:+910000000000", label: "Phone" },
          { icon: <MapPin className="h-5 w-5" />, href: "/#shop", label: "Shop" },
        ]}
        mainLinks={[
          { href: "#best-seller", label: "Best sellers" },
          { href: "/#shop", label: "Shop" },
          { href: "/cart", label: "Cart" },
          { href: "#categories", label: "Categories" },
          { href: "/creator", label: "Admin" },
        ]}
        legalLinks={[
          { href: "#", label: "Shipping & returns" },
          { href: "#", label: "Privacy" },
          { href: "#", label: "Terms" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} Sawbhagya`,
          license: "All rights reserved",
        }}
      />
    </main>
  );
}
