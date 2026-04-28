"use client";

import Link from "next/link";
import * as React from "react";
import { CLOTHING_SUBCATEGORIES, type ClothingCategory } from "@/lib/products";
import { PRIMARY_NAV } from "@/lib/navigation";
import { subAnchorId } from "@/components/categories/category-subcategory-shops";

type CategorySidebarProps = {
  category: ClothingCategory;
  className?: string;
};

export function CategorySidebar({ category, className }: CategorySidebarProps) {
  const [open, setOpen] = React.useState(false);
  const subs = CLOTHING_SUBCATEGORIES[category] ?? [];
  const basePath = `/categories/${category}`;

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
  onNavigate,
}: {
  category: ClothingCategory;
  subs: string[];
  categoryLinks: Array<{ name: string; href: string }>;
  basePath: string;
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
      href: `${basePath}?sub=${encodeURIComponent(s)}#all-products`,
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
            href={`${basePath}#best-sellers`}
            onClick={onNavigate}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Best sellers
          </Link>
          <Link
            href={`${basePath}#all-products`}
            onClick={onNavigate}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            All products
          </Link>
        </div>
      </div>

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

