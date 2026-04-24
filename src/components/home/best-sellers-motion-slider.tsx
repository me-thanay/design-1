"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductCartControl } from "@/components/cart/product-cart-control";
import type { Product } from "@/lib/products";
import { X } from "lucide-react";

type BestSellersMotionItem = {
  product: Product;
  imageSrc: string;
  badge?: string;
};

function normalizeSrc(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (!src.startsWith("/")) return src;
  return encodeURI(src);
}

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function BestSellersMotionSlider({
  items,
  durationSeconds = 22,
  className,
}: {
  items: BestSellersMotionItem[];
  durationSeconds?: number;
  className?: string;
}) {
  const base = React.useMemo(
    () =>
      (items ?? [])
        .filter((x) => x?.product && x?.imageSrc)
        .map((x) => ({ ...x, imageSrc: normalizeSrc(x.imageSrc) })),
    [items],
  );
  const duplicated = React.useMemo(() => [...base, ...base], [base]);

  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);
  const active = activeIdx == null ? null : base[activeIdx] ?? null;

  if (base.length === 0) return null;

  return (
    <div className={className}>
      <div className="image-auto-slider__pause relative w-full overflow-hidden">
        <div className="image-auto-slider__mask">
          <div
            className="image-auto-slider__track motion-reduce:animate-none flex w-max gap-3 sm:gap-6"
            style={
              {
                ["--image-auto-slider-duration" as any]: `${durationSeconds}s`,
              } as React.CSSProperties
            }
          >
            {duplicated.map((it, index) => {
              const realIndex = index % base.length;
              const rating = Number(it.product.rating || 0);
              const price = formatINR(it.product.price);
              return (
                <button
                  key={`${it.product.id}-${index}`}
                  type="button"
                  className="group relative w-[220px] shrink-0 overflow-hidden rounded-3xl border border-black/10 bg-white/70 text-left shadow-md ring-1 ring-black/[0.03] transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                  onClick={() => {
                    setActiveIdx(realIndex);
                    setOpen(true);
                  }}
                >
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.imageSrc}
                      alt={it.product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
                    {it.badge ? (
                      <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#c9a227] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm ring-1 ring-black/10">
                        {it.badge}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base font-bold text-neutral-900">
                        {it.product.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-neutral-900">{price}</span>
                        <span className="text-xs font-semibold text-neutral-700">
                          {rating ? `${rating.toFixed(1)}★` : "—"}
                        </span>
                      </div>
                    </div>
                    <ProductCartControl
                      product={it.product}
                      image={it.imageSrc}
                      tone="card"
                      compact
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[rgb(252_250_247)] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[rgb(252_250_247)] to-transparent sm:w-24" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {active ? (
          <DialogContent className="max-w-[94vw] sm:max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">{active.product.name}</DialogTitle>
            <div className="relative grid max-h-[86vh] grid-rows-[auto_1fr] sm:max-h-[82vh] sm:grid-cols-[1.25fr_1fr] sm:grid-rows-1">
              {/* Image */}
              <div className="relative bg-neutral-50 sm:rounded-l-xl">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm ring-1 ring-black/10 transition hover:bg-white"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative h-[44vh] w-full sm:h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.imageSrc}
                    alt={active.product.name}
                    className="h-full w-full object-contain bg-neutral-50"
                    decoding="async"
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 sm:rounded-l-xl" />
                </div>
              </div>

              {/* Details */}
              <div className="overflow-y-auto bg-white p-5 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                      {active.product.name}
                    </h3>
                    {active.product.subcategory ? (
                      <p className="mt-1 text-sm font-medium text-neutral-600">
                        {active.product.subcategory}
                      </p>
                    ) : null}
                  </div>
                  {active.badge ? (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-[#c9a227] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 ring-1 ring-black/10">
                      {active.badge}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                    {formatINR(active.product.price)}
                  </span>
                  <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 ring-1 ring-black/5">
                    {Number(active.product.rating || 0)
                      ? `${Number(active.product.rating).toFixed(1)}★`
                      : "No rating"}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Description
                  </p>
                  {active.product.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                      {active.product.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-600">
                      Add a description in the Creator dashboard to show it here.
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <ProductCartControl
                    product={active.product}
                    image={active.imageSrc}
                    tone="card"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

