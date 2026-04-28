"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductCartControl } from "@/components/cart/product-cart-control";
import type { Product } from "@/lib/products";

function formatInr(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function ProductDetailsDialog({
  open,
  onOpenChange,
  product,
  fallbackImage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  fallbackImage: string;
}) {
  const images = React.useMemo(() => {
    if (!product) return [] as string[];
    const base = (product.images ?? []).filter(Boolean);
    const primary = product.image ? [product.image] : [];
    const merged = [...base, ...primary]
      .map((u) => String(u || "").trim())
      .filter(Boolean)
      .filter((u, i, arr) => arr.indexOf(u) === i);
    return merged.length ? merged : [fallbackImage];
  }, [product, fallbackImage]);

  const [activeIdx, setActiveIdx] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    setActiveIdx(0);
  }, [open, product?.id]);

  const activeImage = images[activeIdx] ?? images[0] ?? fallbackImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {product ? (
        <DialogContent className="max-w-[94vw] sm:max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>

          <div className="relative grid max-h-[86vh] grid-rows-[auto_1fr] sm:max-h-[82vh] sm:grid-cols-[1.35fr_1fr] sm:grid-rows-1">
            <div className="relative bg-neutral-50 sm:rounded-l-xl">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm ring-1 ring-black/10 transition hover:bg-white"
                aria-label="Close"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative h-[44vh] w-full sm:h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-contain bg-neutral-50"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 sm:rounded-l-xl" />
              </div>

              {images.length > 1 ? (
                <div className="no-scrollbar absolute bottom-0 left-0 right-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-black/35 via-black/10 to-transparent p-3">
                  {images.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveIdx(idx);
                      }}
                      className={[
                        "h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 transition",
                        idx === activeIdx
                          ? "ring-white shadow-md"
                          : "ring-white/40 hover:ring-white/70",
                      ].join(" ")}
                      aria-label={`View image ${idx + 1}`}
                      title={`Image ${idx + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover bg-white/20"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="overflow-y-auto bg-white p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                    {product.name}
                  </h3>
                  {product.subcategory ? (
                    <p className="mt-1 text-sm font-medium text-neutral-600">
                      {product.subcategory}
                    </p>
                  ) : null}
                </div>
                {product.discountPercent > 0 ? (
                  <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                    -{product.discountPercent}%
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                  {formatInr(product.price)}
                </span>
                {product.discountPercent > 0 ? (
                  <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-black/5 line-through">
                    {formatInr(product.originalPrice)}
                  </span>
                ) : null}
                <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 ring-1 ring-black/5">
                  {Number(product.rating || 0) ? `${Number(product.rating).toFixed(1)}★` : "No rating"}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Description
                </p>
                {product.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                    {product.description}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-neutral-600">
                    Add a description in the Creator dashboard to show it here.
                  </p>
                )}
              </div>

              <div className="mt-6" onClick={(e) => e.stopPropagation()}>
                <ProductCartControl
                  product={product}
                  image={activeImage}
                  tone="card"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

