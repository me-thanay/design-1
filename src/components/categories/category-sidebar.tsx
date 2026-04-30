"use client";

import Link from "next/link";
import * as React from "react";
import { CLOTHING_SUBCATEGORIES, normalizeProductRow, type ClothingCategory, type Product } from "@/lib/products";
import { PRIMARY_NAV } from "@/lib/navigation";
import { subAnchorId } from "@/components/categories/category-subcategory-shops";
import { useSearchParams } from "next/navigation";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

function uniqSorted(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function buildHref(basePath: string, params: Record<string, string | null | undefined>, hash?: string) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    const val = (v ?? "").trim();
    if (val) sp.set(k, val);
  });
  const qs = sp.toString();
  return `${basePath}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

type CategorySidebarProps = {
  category: ClothingCategory;
  className?: string;
};

export function CategorySidebar({ category, className }: CategorySidebarProps) {
  const [open, setOpen] = React.useState(false);
  const subs = CLOTHING_SUBCATEGORIES[category] ?? [];
  const basePath = `/categories/${category}`;
  const searchParams = useSearchParams();
  const selectedSub = (searchParams.get("sub") ?? "").trim() || null;
  const selectedColor = (searchParams.get("color") ?? "").trim() || null;
  const selectedSize = category === "sarees" ? null : (searchParams.get("size") ?? "").trim() || null;

  const [variantFacets, setVariantFacets] = React.useState<{ colors: string[]; sizes: string[] }>({
    colors: [],
    sizes: [],
  });

  React.useEffect(() => {
    const load = async () => {
      if (!supabaseEnabled) return;
      try {
        const base = supabase.from("clothes").select("*").eq("in_stock", true);
        let res = await base.order("created_at", { ascending: false });
        if (res.error && /created_at|column .*created_at/i.test(res.error.message ?? "")) {
          res = await base.order("id", { ascending: false });
        }
        if (res.error || !res.data) return;

        const products = (res.data as any[])
          .map((r) => normalizeProductRow(r))
          .filter((p: Product) => p.inStock && p.category === category)
          .filter((p: Product) =>
            selectedSub ? (p.subcategory ?? "").toLowerCase() === selectedSub.toLowerCase() : true,
          );

        const colors = uniqSorted(products.flatMap((p) => p.colors ?? []));
        const sizes =
          category === "sarees" ? [] : uniqSorted(products.flatMap((p) => p.sizes ?? []));
        setVariantFacets({ colors, sizes });
      } catch {
        // ignore
      }
    };
    void load();
  }, [category, selectedSub]);

  const categoryLinks = PRIMARY_NAV.filter(
    (x) => x.href.startsWith("/categories/") && x.name !== "Shop" && x.name !== "Cart",
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-900 shadow-sm"
        >
          Filters & categories
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86vw] max-w-sm bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
              <div className="text-sm font-semibold text-neutral-900">Browse</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-neutral-800"
              >
                Close
              </button>
            </div>
            <div className="h-full overflow-y-auto p-4">
              <SidebarInner
                category={category}
                subs={subs}
                categoryLinks={categoryLinks}
                basePath={basePath}
                selectedSub={selectedSub}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                variantFacets={variantFacets}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <aside
        className={[
          "hidden lg:block",
          "sticky top-24 self-start",
          "rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur",
          className ?? "",
        ].join(" ")}
      >
        <SidebarInner
          category={category}
          subs={subs}
          categoryLinks={categoryLinks}
          basePath={basePath}
          selectedSub={selectedSub}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          variantFacets={variantFacets}
        />
      </aside>
    </>
  );
}

function SidebarInner({
  category,
  subs,
  categoryLinks,
  basePath,
  selectedSub,
  selectedColor,
  selectedSize,
  variantFacets,
  onNavigate,
}: {
  category: ClothingCategory;
  subs: string[];
  categoryLinks: Array<{ name: string; href: string }>;
  basePath: string;
  selectedSub?: string | null;
  selectedColor?: string | null;
  selectedSize?: string | null;
  variantFacets?: { colors: string[]; sizes: string[] };
  onNavigate?: () => void;
}) {
  const navName: Record<ClothingCategory, string> = {
    sarees: "SAREE",
    kurtis: "KURTIS",
    blouses: "BLOUSES",
    gowns: "GOWNS",
  };
  const nav = PRIMARY_NAV.find((n) => n.name === navName[category]);
  const subCards = (subs ?? []).map((s) => {
    const hit = nav?.items?.find((x) => x.name.toLowerCase() === s.toLowerCase());
    return {
      name: s,
      href: buildHref(
        basePath,
        { sub: s, color: selectedColor, size: selectedSize },
        "all-products",
      ),
      imageSrc: hit?.imageSrc ?? nav?.featuredImageSrc ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Filters
        </p>
        <div className="mt-3 grid gap-2">
          <Link
            href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: selectedSize }, "best-sellers")}
            onClick={onNavigate}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Best sellers
          </Link>
          <Link
            href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: selectedSize }, "all-products")}
            onClick={onNavigate}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            All products
          </Link>
        </div>
      </div>

      {variantFacets && (variantFacets.colors.length || variantFacets.sizes.length) ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Colors & sizes
          </p>
          <div className="mt-3 space-y-3">
            {variantFacets.colors.length ? (
              <div>
                <div className="text-xs font-semibold text-neutral-700">Color</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={buildHref(basePath, { sub: selectedSub, color: null, size: selectedSize }, "all-products")}
                    onClick={onNavigate}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      !selectedColor ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white text-neutral-900 hover:bg-neutral-50",
                    )}
                  >
                    All
                  </Link>
                  {variantFacets.colors.map((c) => (
                    <Link
                      key={c}
                      href={buildHref(basePath, { sub: selectedSub, color: c, size: selectedSize }, "all-products")}
                      onClick={onNavigate}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        selectedColor?.toLowerCase() === c.toLowerCase()
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-black/10 bg-white text-neutral-900 hover:bg-neutral-50",
                      )}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {category !== "sarees" && variantFacets.sizes.length ? (
              <div>
                <div className="text-xs font-semibold text-neutral-700">Size</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: null }, "all-products")}
                    onClick={onNavigate}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      !selectedSize ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white text-neutral-900 hover:bg-neutral-50",
                    )}
                  >
                    All
                  </Link>
                  {variantFacets.sizes.map((s) => (
                    <Link
                      key={s}
                      href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: s }, "all-products")}
                      onClick={onNavigate}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        selectedSize?.toLowerCase() === s.toLowerCase()
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-black/10 bg-white text-neutral-900 hover:bg-neutral-50",
                      )}
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Subcategories
        </p>
        <div className="mt-3 grid gap-2">
          {subCards.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.imageSrc ? (
                  <img
                    src={encodeURI(s.imageSrc)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{s.name}</span>
                <span className="mt-0.5 block text-[11px] font-medium text-neutral-500">
                  Tap to view
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

