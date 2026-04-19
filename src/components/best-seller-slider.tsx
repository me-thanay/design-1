"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { MediaItemType } from "@/components/ui/interactive-bento-gallery";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatPriceFallback(value?: string) {
  return value ?? "";
}

export default function BestSellerSlider({
  items,
  title = "Best Seller",
  description = "Swipe through best sellers loved by customers.",
}: {
  items: MediaItemType[];
  title?: string;
  description?: string;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const safeIndex = items.length === 0 ? 0 : Math.min(activeIndex, items.length - 1);
  const active = items[safeIndex];

  const go = (dir: -1 | 1) => {
    if (items.length === 0) return;
    setActiveIndex((i) => (i + dir + items.length) % items.length);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
          {description}
        </p>
      </div>

      <div className="relative">
        <div className="grid gap-5 lg:grid-cols-[1fr_260px] lg:items-start">
          <div>
            {active ? (
              <article className="relative overflow-hidden rounded-3xl bg-neutral-950 shadow-xl ring-1 ring-black/10">
                <img
                  key={active.id}
                  src={active.url}
                  alt={active.title}
                  className="h-[320px] w-full object-cover sm:h-[380px] lg:h-[420px]"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {active.badge && (
                  <div className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {active.badge}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-base font-semibold text-white sm:text-xl">{active.title}</h3>
                  <p className="mt-1 text-xs text-white/80 sm:text-sm">{active.desc}</p>

                  {(active.price || active.mrp) && (
                    <div className="mt-2 flex items-baseline gap-2 text-white">
                      {active.price && (
                        <span className="text-sm font-semibold sm:text-lg">
                          {formatPriceFallback(active.price)}
                        </span>
                      )}
                      {active.mrp && (
                        <span className="text-xs text-white/70 line-through sm:text-sm">
                          {formatPriceFallback(active.mrp)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ) : null}

            <div className="relative z-20 mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => go(-1)}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "icon" }),
                    "cursor-pointer pointer-events-auto",
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => go(1)}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "icon" }),
                    "cursor-pointer pointer-events-auto",
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to item ${i + 1}`}
                    onClick={() => setActiveIndex(i)}
                    className={[
                      "h-1.5 rounded-full transition-all cursor-pointer pointer-events-auto",
                      i === safeIndex
                        ? "w-8 bg-neutral-900/70"
                        : "w-3 bg-neutral-400/50 hover:bg-neutral-500/60",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop thumbnails */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-black/10 bg-white/40 p-3 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  Quick pick
                </p>
                <p className="text-xs text-neutral-500">
                  {activeIndex + 1}/{items.length}
                </p>
              </div>

              <div className="space-y-2">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition",
                      i === safeIndex ? "bg-black/5 ring-1 ring-black/10" : "hover:bg-black/5",
                    ].join(" ")}
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-neutral-200 ring-1 ring-black/10">
                      <img
                        src={item.url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{item.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-neutral-600">
                        {item.price ? formatPriceFallback(item.price) : ""}
                        {item.mrp ? ` · ${formatPriceFallback(item.mrp)}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

