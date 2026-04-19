"use client";

import Link from "next/link";
import { ProductsGrid } from "@/components/products/products-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FeaturedSpotlight, type FeaturedSpotlightProps } from "@/components/ui/feature-spotlight";
import { CLOTHING_SUBCATEGORIES, type ClothingCategory } from "@/lib/products";
import { cn } from "@/lib/utils";

export function subAnchorId(sub: string) {
  return `shop-${sub.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
}

function titleCaseLine(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Pill links only — same subcategories as Creator admin (jumps to `#shop-…` sections). */
export function CategorySubcategoryPills({
  category,
  className = "",
}: {
  category: ClothingCategory;
  className?: string;
}) {
  const subs = CLOTHING_SUBCATEGORIES[category];

  return (
    <nav aria-label="Jump to subcategory" className={cn("flex flex-wrap gap-2", className)}>
      {subs.map((sub) => (
        <Link
          key={sub}
          href={`#${subAnchorId(sub)}`}
          className="font-serif rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-900 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-md sm:px-4 sm:py-2 sm:text-sm"
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
  className = "",
}: {
  category: ClothingCategory;
  categoryTitle: string;
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
        <CategorySubcategoryPills category={category} className="mt-6" />
      </ScrollReveal>
    </div>
  );
}

/** Per-subcategory product galleries (anchor targets for `CategorySubcategoryPills`). */
export function CategorySubcategoryProductSections({
  category,
}: {
  category: ClothingCategory;
}) {
  const subs = CLOTHING_SUBCATEGORIES[category];

  return (
    <div className="mt-12 space-y-14 sm:space-y-16">
      {subs.map((sub) => (
        <section
          key={sub}
          id={subAnchorId(sub)}
          className="scroll-mt-28"
        >
          <ScrollReveal variant="fade-up" y={22}>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
              {titleCaseLine(sub)}
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Products tagged &ldquo;{sub}&rdquo; in this category.
            </p>
          </ScrollReveal>
          <ProductsGrid
            category={category}
            subcategory={sub}
            limit={12}
            variant="gallery"
            className="mt-6"
          />
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
