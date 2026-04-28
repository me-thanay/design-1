"use client";

import Link from "next/link";
import { ProductsGrid } from "@/components/products/products-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FeaturedSpotlight, type FeaturedSpotlightProps } from "@/components/ui/feature-spotlight";
import { CLOTHING_SUBCATEGORIES, type ClothingCategory } from "@/lib/products";
import { PRIMARY_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { motion } from "motion/react";

export function subAnchorId(sub: string) {
  return `shop-${sub.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
}

function titleCaseLine(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeSrc(src?: string) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (!src.startsWith("/")) return src;
  return encodeURI(src);
}

function subcategoryHeroImage(category: ClothingCategory, sub: string) {
  const navName: Record<ClothingCategory, string> = {
    sarees: "SAREE",
    kurtis: "KURTIS",
    blouses: "BLOUSES",
    gowns: "GOWNS",
  };

  const nav = PRIMARY_NAV.find((n) => n.name === navName[category]);
  const hit = nav?.items?.find((x) => x.name.toLowerCase() === sub.toLowerCase());
  return normalizeSrc(hit?.imageSrc ?? nav?.featuredImageSrc);
}

function subcategoryHeroPosition(category: ClothingCategory, src: string) {
  if (category === "gowns") {
    if (src.includes("PARTY%20WEAR%20GOWN") || src.includes("PARTY WEAR GOWN")) return "46% 16%";
    if (src.includes("CASUAL%20WEAR%20GOWN") || src.includes("CASUAL WEAR GOWN")) return "55% 16%";
    return "50% 16%";
  }
  if (category === "sarees") {
    // Saree subcategory banners vary a lot (landscape + portrait).
    if (src.includes("banarassilk-saree")) return "56% 18%";
    if (src.toLowerCase().includes("georgette-saree")) return "55% 12%";
    if (src.toLowerCase().includes("organza-saree")) return "52% 14%";
    if (src.toLowerCase().includes("modalsilk-saree")) return "52% 16%";
    if (src.toLowerCase().includes("linen-saree")) return "52% 14%";
    return "52% 16%";
  }
  return "50% 18%";
}

/** Pill links only — same subcategories as Creator admin (jumps to `#shop-…` sections). */
export function CategorySubcategoryPills({
  category,
  selectedSubcategory,
  className = "",
}: {
  category: ClothingCategory;
  selectedSubcategory?: string | null;
  className?: string;
}) {
  const subs = CLOTHING_SUBCATEGORIES[category];

  return (
    <nav aria-label="Jump to subcategory" className={cn("flex flex-wrap gap-2", className)}>
      <Link
        href="?"
        className={cn(
          "font-serif rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:py-2 sm:text-sm",
          !selectedSubcategory
            ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
            : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
        )}
        aria-label="Show all subcategories"
      >
        All
      </Link>
      {subs.map((sub) => (
        <Link
          key={sub}
          href={`?sub=${encodeURIComponent(sub)}`}
          className={cn(
            "font-serif rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:py-2 sm:text-sm",
            selectedSubcategory?.toLowerCase() === sub.toLowerCase()
              ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
              : "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
          )}
          aria-current={
            selectedSubcategory?.toLowerCase() === sub.toLowerCase()
              ? "page"
              : undefined
          }
        >
          {titleCaseLine(sub)}
        </Link>
      ))}
    </nav>
  );
}

/** Category page featured block with subcategory pills under the Shop CTA. */
export function CategoryPageSpotlight({
  category,
  ...spotlight
}: FeaturedSpotlightProps & { category: ClothingCategory }) {
  return (
    <FeaturedSpotlight
      {...spotlight}
      afterCta={<CategorySubcategoryPills category={category} />}
    />
  );
}

/** Top-of-page block: shop-by-type label, heading, copy, and jump links (matches category admin subcategories). */
export function CategorySubcategoryIntro({
  category,
  categoryTitle,
  selectedSubcategory,
  className = "",
}: {
  category: ClothingCategory;
  categoryTitle: string;
  selectedSubcategory?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <ScrollReveal variant="fade-up" y={18} duration={0.55}>
        <div className="max-w-2xl">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Shop by type
          </p>
          <h2 className="font-serif mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Subcategories from Creator
          </h2>
          <p className="font-serif mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Same fabric and style tags you set in the admin — each section shows in-stock items for{" "}
            {categoryTitle}.
          </p>
        </div>
        <CategorySubcategoryPills
          category={category}
          selectedSubcategory={selectedSubcategory}
          className="mt-6"
        />
      </ScrollReveal>
    </div>
  );
}

/** Per-subcategory product galleries (anchor targets for `CategorySubcategoryPills`). */
export function CategorySubcategoryProductSections({
  category,
  selectedSubcategory,
}: {
  category: ClothingCategory;
  selectedSubcategory?: string | null;
}) {
  const subs = CLOTHING_SUBCATEGORIES[category];
  // Only show the big subcategory hero blocks when a subcategory is explicitly selected.
  // Otherwise the category page should stay clean and show the regular product grid.
  if (!selectedSubcategory) return null;
  const filteredSubs = selectedSubcategory
    ? subs.filter((s) => s.toLowerCase() === selectedSubcategory.toLowerCase())
    : subs;

  return (
    <div className="mt-12 space-y-14 sm:space-y-16">
      {filteredSubs.map((sub) => (
        <section
          key={sub}
          id={subAnchorId(sub)}
          className="scroll-mt-28"
        >
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm">
            <motion.div
              className="group relative isolate overflow-hidden min-h-[220px] sm:min-h-[260px]"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => {
                const el = document.getElementById(`${subAnchorId(sub)}-grid`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                const el = document.getElementById(`${subAnchorId(sub)}-grid`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {(() => {
                const img = subcategoryHeroImage(category, sub);
                if (!img) return null;
                // eslint-disable-next-line @next/next/no-img-element
                return (
                  <img
                    src={img}
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                    style={{ objectPosition: subcategoryHeroPosition(category, img) }}
                    loading="lazy"
                    decoding="async"
                  />
                );
              })()}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/35 to-black/0" />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(70% 70% at 20% 30%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)",
                }}
              />

              <ProgressiveBlur
                className="pointer-events-none absolute inset-0 -z-10"
                blurIntensity={0.45}
              />

              <div className="flex flex-col gap-3 px-6 py-7 sm:px-8 sm:py-8">
                <h3 className="text-balance font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {titleCaseLine(sub)}
                </h3>
                <p className="max-w-2xl text-sm text-white/80 sm:text-base">
                  Products tagged “{sub}” — tap to jump into the collection.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={`#${subAnchorId(sub)}-grid`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const el = document.getElementById(`${subAnchorId(sub)}-grid`);
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex rounded-full bg-black/35 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-black/45 active:scale-[0.98] transition"
                    aria-label={`Swipe products below for ${titleCaseLine(sub)}`}
                  >
                    Swipe products below
                  </a>
                  <a
                    href={`#${subAnchorId(sub)}-grid`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const el = document.getElementById(`${subAnchorId(sub)}-grid`);
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-900 shadow hover:bg-neutral-50 active:scale-[0.98] transition"
                    aria-label={`View items in ${titleCaseLine(sub)}`}
                  >
                    View items
                  </a>
                </div>
              </div>
            </motion.div>

            <div id={`${subAnchorId(sub)}-grid`} className="p-6 sm:p-8">
              <ProductsGrid
                category={category}
                subcategory={sub}
                limit={12}
                variant="gallery"
              />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

/** Full flow: intro + sections (for pages that don’t split them). */
export function CategorySubcategoryShops({
  category,
  categoryTitle,
}: {
  category: ClothingCategory;
  categoryTitle: string;
}) {
  return (
    <>
      <CategorySubcategoryIntro category={category} categoryTitle={categoryTitle} />
      <CategorySubcategoryProductSections category={category} />
    </>
  );
}
