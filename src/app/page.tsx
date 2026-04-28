import { HeroLanding } from "@/components/ui/hero-1";
import type { HeroLandingProps } from "@/components/ui/hero-1";
import { HomeTrustLogoCloud } from "@/components/home/home-trust-logo-cloud";
import { HomeAboutSawbhagya } from "@/components/home/home-about-sawbhagya";
import { HomeWhySawbhagya } from "@/components/home/home-why-sawbhagya";
import { HomeBestSellersSection } from "@/components/home/home-best-sellers-section";
import { HomeTestimonialsMarquee } from "@/components/home/home-testimonials-marquee";
import { Footer } from "@/components/ui/footer";
import Slideshow from "@/components/ui/slideshow";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
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

      <HomeAboutSawbhagya />
      <HomeWhySawbhagya />

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
          </ScrollRevealGroup>
        </div>
      </section>

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

      <ScrollReveal y={36}>
        <Slideshow className="surface-texture pb-16 pt-2" />
      </ScrollReveal>

      <HomeTestimonialsMarquee />

      <section className="surface-texture border-b border-black/5 pb-14 pt-2">
        <div className="mx-auto w-full max-w-6xl px-4">
          <ScrollRevealGroup stagger={0.08} delayChildren={0.02} variant="fade-up" y={22}>
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Legal
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                Terms & conditions
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Exchange, return, and policy details for your orders.
              </p>
            </div>

            <div className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700 sm:text-base">
                <li>48-hour exchange facility on Domestic orders.</li>
                <li>Exchange requests must be raised within 48 hours of delivery with Order ID.</li>
                <li>No refunds. Exchange via coupon after quality check.</li>
              </ul>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href="/terms"
                  className="inline-flex items-center rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
                >
                  Read full terms
                </a>
                <a
                  href="/shipping-returns"
                  className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-5 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-white"
                >
                  Shipping & returns
                </a>
              </div>
            </div>
          </ScrollRevealGroup>
        </div>
      </section>

      <Footer
        logo={
          <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="h-9 w-9 rounded-sm object-contain" />
        }
        brandName="Sawbhagya"
        contact={{
          phone: "8978237992",
          email: "info@sawbhagya.com",
          address:
            "Sri Sai Anjaneya Residency- 1st Floor , Sri Sai Balaji Enclave Main Road, Mallampet, Hyderabad, Telangana 500090",
          mapsHref: "https://maps.app.goo.gl/VP6MioWj7HuQsL839?g_st=iw",
          whatsappHref:
            "https://wa.me/918978237992?text=" +
            encodeURIComponent("Hi Sawbhagya, I want to know more about your products."),
        }}
        socialLinks={[
          { icon: <MessageCircle className="h-5 w-5" />, href: "https://wa.me/918978237992", label: "WhatsApp" },
          { icon: <Mail className="h-5 w-5" />, href: "mailto:info@sawbhagya.com", label: "Email" },
          { icon: <Phone className="h-5 w-5" />, href: "tel:+918978237992", label: "Phone" },
          {
            icon: <MapPin className="h-5 w-5" />,
            href: "https://maps.app.goo.gl/VP6MioWj7HuQsL839?g_st=iw",
            label: "Location",
          },
        ]}
        mainLinks={[
          { href: "#best-seller", label: "Best sellers" },
          { href: "/#shop", label: "Shop" },
          { href: "/cart", label: "Cart" },
          { href: "#categories", label: "Categories" },
          { href: "/creator", label: "Admin" },
        ]}
        legalLinks={[
          { href: "/shipping-returns", label: "Shipping & returns" },
          { href: "#", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} Sawbhagya`,
          license: "All rights reserved",
        }}
      />
    </main>
  );
}
