"use client";

import Link from "next/link";
import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CLOTHING_SUBCATEGORIES, normalizeProductRow, type ClothingCategory, type Product } from "@/lib/products";
import { PRIMARY_NAV } from "@/lib/navigation";
import { subAnchorId } from "@/components/categories/category-subcategory-shops";
import { useSearchParams } from "next/navigation";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { cn, publicAssetUrl } from "@/lib/utils";

const LOCAL_CLOTHES_KEY = "freelance-1.local.clothes.v1";

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

function buildHref(basePath: string, params: Record<string, string | null | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    const val = (v ?? "").trim();
    if (val) sp.set(k, val);
  });
  const qs = sp.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

type CategorySidebarProps = {
  category: ClothingCategory;
  className?: string;
};

export function CategorySidebar({ category, className }: CategorySidebarProps) {
  const [open, setOpen] = React.useState(false);
  const modalContentRef = React.useRef<HTMLDivElement>(null);
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
    if (open && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [open]);

  React.useEffect(() => {
    const load = async () => {
      try {
        let rows: any[] = [];
        if (!supabaseEnabled) {
          const raw = window.localStorage.getItem(LOCAL_CLOTHES_KEY);
          let parsed: any[] = [];
          try {
            parsed = raw ? (JSON.parse(raw) as any[]) : [];
          } catch {
            parsed = [];
          }
          rows = Array.isArray(parsed) ? parsed : [];
        } else {
          const base = supabase.from("clothes").select("*").eq("in_stock", true);
          let res = await base.order("created_at", { ascending: false });
          if (res.error && /created_at|column .*created_at/i.test(res.error.message ?? "")) {
            res = await base.order("id", { ascending: false });
          }
          if (res.error || !res.data) return;
          rows = (res.data as any[]) ?? [];
        }

        const products = rows
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
          className="flex items-center justify-between w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 transition active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-neutral-700" />
            <span>Filters & categories</span>
          </span>
          <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
            Browse
          </span>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden animate-in fade-in duration-200">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 z-10">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 shrink-0 bg-white">
              <div className="flex items-center gap-2 text-base font-bold text-neutral-900">
                <SlidersHorizontal className="h-4 w-4 text-neutral-700" />
                <span>Filters & categories</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div ref={modalContentRef} className="flex-1 overflow-y-auto p-5 space-y-6">
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
    coord_sets: "COORD SET",
  };
  const nav = PRIMARY_NAV.find((n) => n.name === navName[category]);
  const subCards = (subs ?? []).map((s) => {
    const hit = nav?.items?.find((x) => x.name.toLowerCase() === s.toLowerCase());
    return {
      name: s,
      href: buildHref(
        basePath,
        { sub: s, color: selectedColor, size: selectedSize },
      ),
      imageSrc: hit?.imageSrc ?? nav?.featuredImageSrc ?? null,
    };
  });

  const handleFilterClick = (targetId: string = "best-sellers") => {
    if (onNavigate) onNavigate();
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Filters
        </p>
        <div className="mt-3 grid gap-2">
          <Link
            href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: selectedSize })}
            scroll={false}
            onClick={() => handleFilterClick("best-sellers")}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition"
          >
            Best sellers
          </Link>
          <Link
            href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: selectedSize })}
            scroll={false}
            onClick={() => handleFilterClick("all-products")}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition"
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
                    href={buildHref(basePath, { sub: selectedSub, color: null, size: selectedSize })}
                    scroll={false}
                    onClick={() => handleFilterClick("best-sellers")}
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
                      href={buildHref(basePath, { sub: selectedSub, color: c, size: selectedSize })}
                      scroll={false}
                      onClick={() => handleFilterClick("best-sellers")}
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
                    href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: null })}
                    scroll={false}
                    onClick={() => handleFilterClick("best-sellers")}
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
                      href={buildHref(basePath, { sub: selectedSub, color: selectedColor, size: s })}
                      scroll={false}
                      onClick={() => handleFilterClick("best-sellers")}
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
              scroll={false}
              onClick={() => handleFilterClick("best-sellers")}
              className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition"
            >
              <span
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5",
                  category === "coord_sets" ? "h-14 w-24" : "h-14 w-20",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.imageSrc ? (
                  <img
                    src={publicAssetUrl(s.imageSrc)}
                    alt=""
                    className={cn(
                      "h-full w-full",
                      category === "coord_sets" ? "object-contain object-center" : "object-cover",
                    )}
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
