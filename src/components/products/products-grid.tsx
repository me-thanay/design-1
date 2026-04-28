"use client";

import * as React from "react";
import Link from "next/link";
import { ImageGallery } from "@/components/ui/image-gallery";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ProductCartControl } from "@/components/cart/product-cart-control";
import { ProductDetailsDialog } from "@/components/products/product-details-dialog";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import type { ClothingCategory, Product } from "@/lib/products";
import { normalizeProductRow } from "@/lib/products";

const LOCAL_CLOTHES_KEY = "freelance-1.local.clothes.v1";

type ProductsGridProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  category?: ClothingCategory;
  /** Narrow results by name / description / subcategory (client-side). */
  filterQuery?: string;
  /** Exact match on normalized subcategory (case-insensitive), e.g. Creator dashboard tag. */
  subcategory?: string;
  limit?: number;
  variant?: "grid" | "row" | "gallery";
  className?: string;
};

function fallbackImageFor(category?: ClothingCategory) {
  switch (category) {
    case "blouses":
      return "/stock_images/PARTY%20WEAR%20BLOUSE.jpeg";
    case "kurtis":
      return "/stock_images/COTTON%20KURTI.jpeg";
    case "gowns":
      return "/stock_images/PARTY%20WEAR%20GOWN.jpeg";
    case "sarees":
    default:
      return "/stock_images/banarasi%20silk.jpeg";
  }
}

function relatedHref(p: Product) {
  const params = new URLSearchParams();
  params.set("cat", p.category);
  if (p.subcategory) params.set("q", p.subcategory);
  return `/?${params.toString()}`;
}

function starsFor(rating: number) {
  const n = Math.min(5, Math.max(1, Math.round(rating)));
  return "★".repeat(n);
}

function formatInr(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function imagePositionFor(category: ClothingCategory | undefined, src: string) {
  if (category !== "gowns") return undefined;
  const s = src ?? "";
  if (s.includes("PARTY%20WEAR%20GOWN") || s.includes("PARTY WEAR GOWN")) return "46% 16%";
  if (s.includes("CASUAL%20WEAR%20GOWN") || s.includes("CASUAL WEAR GOWN")) return "55% 16%";
  return "50% 16%";
}

function imageFitFor(category: ClothingCategory | undefined) {
  if (!category) return "cover" as const;
  return category === "sarees" ? ("cover" as const) : ("contain" as const);
}

function matchesFilter(p: Product, filterQuery: string) {
  const needle = filterQuery.trim().toLowerCase();
  if (!needle) return true;
  const hay = [p.name, p.description ?? "", p.subcategory ?? ""].join(" ").toLowerCase();
  return hay.includes(needle);
}

function matchesSubcategory(p: Product, subcategory: string | undefined) {
  if (!subcategory?.trim()) return true;
  const a = (p.subcategory ?? "").trim().toLowerCase();
  const b = subcategory.trim().toLowerCase();
  return a === b;
}

export function ProductsGrid({
  title,
  subtitle,
  category,
  filterQuery,
  subcategory,
  limit = 6,
  variant = "grid",
  className,
}: ProductsGridProps) {
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [activeProduct, setActiveProduct] = React.useState<Product | null>(null);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let rows: any[] = [];

        if (!supabaseEnabled) {
          const raw = window.localStorage.getItem(LOCAL_CLOTHES_KEY);
          const parsed = raw ? (JSON.parse(raw) as any[]) : [];
          rows = Array.isArray(parsed) ? parsed : [];
        } else {
          let q = supabase
            .from("clothes")
            .select("*")
            .eq("in_stock", true)
            .order("created_at", { ascending: false });

          if (category) {
            // category may be stored in a column or encoded in description meta.
            // We filter client-side after normalize to support both shapes.
          }

          const { data, error } = await q;
          if (error) {
            setError(error.message);
            setItems([]);
            return;
          }
          rows = (data as any[]) ?? [];
        }

        const normalized = rows
          .map((r) => normalizeProductRow(r))
          .filter((p) => p.inStock)
          .filter((p) => (category ? p.category === category : true))
          .filter((p) => matchesSubcategory(p, subcategory))
          .filter((p) => (filterQuery ? matchesFilter(p, filterQuery) : true))
          .slice(0, Math.max(0, limit));

        setItems(normalized);
      } catch (e: any) {
        setError(e?.message ?? "Could not load products");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [category, limit, filterQuery, subcategory]);

  const openDetails = (p: Product) => {
    setActiveProduct(p);
    setDetailsOpen(true);
  };

  return (
    <section className={className}>
      {(title || subtitle) && (
        <ScrollReveal variant="fade-down" y={14} duration={0.55} className="mb-4">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          ) : null}
        </ScrollReveal>
      )}

      {loading ? (
        <div className="rounded-3xl border border-black/10 bg-white/60 p-6 text-sm text-neutral-600">
          Loading products…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Products couldn’t load.</p>
          <p className="mt-1">{error}</p>
          <p className="mt-3 text-xs text-red-700/80">
            If this happens only on production, your Supabase table may have RLS
            enabled without a public read policy.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/20 bg-white/50 p-6 text-sm text-neutral-600">
          No products yet in this section. Add items from the Creator dashboard.
        </div>
      ) : variant === "gallery" ? (
        <ImageGallery
          className="py-0"
          containerClassName="w-full px-0"
          headerAlign="left"
          onItemClick={(it) => {
            if (it.product) openDetails(it.product);
          }}
          items={items.map((p) => {
            const img = p.image || fallbackImageFor(p.category);
            const rating = Number(p.rating || 4);
            const price =
              p.discountPercent > 0
                ? `${formatInr(p.price)} (was ${formatInr(p.originalPrice)})`
                : formatInr(p.price);
            return {
              src: img,
              title: p.name,
              subtitle: p.subcategory ? p.subcategory : p.category,
              badge:
                p.discountPercent > 0
                  ? `${p.discountPercent}% off`
                  : p.inStock
                    ? "In stock"
                    : "Limited",
              priceLabel: price,
              ratingLabel: `${starsFor(rating)} (${rating.toFixed(1)})`,
              imagePosition: imagePositionFor(p.category, img),
              imageFit: imageFitFor(p.category),
              product: p,
              cartImage: img,
            };
          })}
        />
      ) : variant === "row" ? (
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {items.map((p) => {
            const img = p.image || fallbackImageFor(p.category);
            const rating = Number(p.rating || 4);
            const pos = imagePositionFor(p.category, img);
            const fit = imageFitFor(p.category);
            return (
              <article
                key={p.id}
                className="group w-[260px] flex-shrink-0 overflow-hidden rounded-3xl border border-black/10 bg-white/60 shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:ring-black/10"
                onClick={() => openDetails(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openDetails(p);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={p.name}
                  className={[
                    "w-full transition-transform duration-500 group-hover:scale-[1.02]",
                    fit === "contain" ? "h-52 object-contain bg-neutral-50" : "h-40 object-cover",
                  ].join(" ")}
                  style={pos ? { objectPosition: pos } : undefined}
                />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 line-clamp-1">
                        {p.name}
                      </p>
                      {p.subcategory ? (
                        <p className="mt-1 text-[11px] capitalize text-neutral-500">
                          {p.subcategory}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      {p.discountPercent > 0 ? (
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-neutral-900">
                            {formatInr(p.price)}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-semibold text-emerald-700">
                              -{p.discountPercent}%
                            </span>
                            <span className="text-[11px] text-neutral-500 line-through">
                              {formatInr(p.originalPrice)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-neutral-900">
                          {formatInr(p.price)}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-amber-700">
                    {starsFor(rating)}{" "}
                    <span className="text-zinc-500">({rating.toFixed(1)})</span>
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={relatedHref(p)}
                      className="text-xs font-semibold text-neutral-700 underline-offset-4 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Related
                    </Link>
                    <span className="text-[11px] text-neutral-500">Free delivery</span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ProductCartControl product={p} image={img} tone="card" compact />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const img = p.image || fallbackImageFor(p.category);
            const rating = Number(p.rating || 4);
            const pos = imagePositionFor(p.category, img);
            const fit = imageFitFor(p.category);
            return (
              <article
                key={p.id}
                className="group overflow-hidden rounded-3xl border border-black/10 bg-white/60 shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-xl hover:ring-black/12"
                onClick={() => openDetails(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openDetails(p);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={p.name}
                  className={[
                    "w-full transition-transform duration-500 group-hover:scale-[1.02]",
                    fit === "contain" ? "h-64 object-contain bg-neutral-50" : "h-48 object-cover",
                  ].join(" ")}
                  style={pos ? { objectPosition: pos } : undefined}
                />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 line-clamp-1">
                        {p.name}
                      </p>
                      {p.subcategory ? (
                        <p className="mt-1 text-[11px] capitalize text-neutral-500">
                          {p.subcategory}
                        </p>
                      ) : null}
                      {p.description ? (
                        <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                          {p.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      {p.discountPercent > 0 ? (
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-neutral-900">
                            {formatInr(p.price)}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-semibold text-emerald-700">
                              -{p.discountPercent}%
                            </span>
                            <span className="text-[11px] text-neutral-500 line-through">
                              {formatInr(p.originalPrice)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-neutral-900">
                          {formatInr(p.price)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium text-amber-700">
                      {starsFor(rating)}{" "}
                      <span className="text-zinc-500">({rating.toFixed(1)})</span>
                    </p>
                    <Link
                      href={relatedHref(p)}
                      className="text-xs font-semibold text-neutral-700 underline-offset-4 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Related
                    </Link>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ProductCartControl product={p} image={img} tone="card" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ProductDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        product={activeProduct}
        fallbackImage={fallbackImageFor(activeProduct?.category)}
      />
    </section>
  );
}

