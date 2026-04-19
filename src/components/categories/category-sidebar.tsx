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
        <SidebarInner category={category} subs={subs} categoryLinks={categoryLinks} />
      </aside>
    </>
  );
}

function SidebarInner({
  category,
  subs,
  categoryLinks,
  onNavigate,
}: {
  category: ClothingCategory;
  subs: string[];
  categoryLinks: Array<{ name: string; href: string }>;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Filters
        </p>
        <div className="mt-3 grid gap-2">
          <Link
            href="#all-products"
            onClick={onNavigate}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            New arrivals
          </Link>
          <Link
            href="#all-products"
            onClick={onNavigate}
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Discounts
          </Link>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          (These are quick jumps for now; product-level filtering can be wired next.)
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Categories
        </p>
        <div className="mt-3 grid gap-2">
          {categoryLinks.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              onClick={onNavigate}
              className={[
                "rounded-2xl border border-black/10 px-4 py-3 text-sm font-medium hover:bg-neutral-50",
                c.href.endsWith(`/${category}`) ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-900",
              ].join(" ")}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Subcategories
        </p>
        <div className="mt-3 grid gap-2">
          {subs.map((s) => (
            <Link
              key={s}
              href={`#${subAnchorId(s)}`}
              onClick={onNavigate}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

