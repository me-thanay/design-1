"use client";

import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { motion } from "motion/react";
import * as React from "react";

export type ImageGalleryItem = {
  src: string;
  title: string;
  subtitle?: string;
  badge?: string;
  priceLabel?: string;
  ratingLabel?: string;
};

export type ImageGalleryProps = {
  title?: string;
  subtitle?: string;
  items: ImageGalleryItem[];
  className?: string;
};

export function ImageGallery({
  title = "Best sellers in detail",
  subtitle = "Hover a card to preview — then browse the collection.",
  items,
  className,
}: ImageGalleryProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const fallbackSrc = "/stock_images/banarasi%20silk.jpeg";
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(Boolean(mq.matches));
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <section className={cn("w-full py-10 sm:py-14", className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">{subtitle}</p>
          {isTouch ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Tap a card to preview
            </p>
          ) : null}
        </div>

        {/* Horizontal scroll keeps the layout stable (no reflow on hover). */}
        <div className="no-scrollbar mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 pt-1 scroll-smooth sm:mx-0 sm:px-0 sm:gap-6 sm:snap-none sm:overflow-visible snap-x snap-mandatory">
          {items.slice(0, 10).map((it, idx) => (
            <motion.article
              key={`${it.title}-${idx}`}
              className={cn(
                "group relative shrink-0 overflow-hidden rounded-3xl bg-white",
                "w-[min(82vw,280px)] sm:w-[260px] md:w-[280px]",
                "ring-1 ring-black/10 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]",
                "transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-22px_rgba(0,0,0,0.45)]",
                "snap-start",
              )}
              onHoverStart={() => setHovered(idx)}
              onHoverEnd={() => setHovered((v) => (v === idx ? null : v))}
              onClick={() => {
                if (!isTouch) return;
                setHovered((v) => (v === idx ? null : idx));
              }}
              whileTap={isTouch ? { scale: 0.98 } : undefined}
              role={isTouch ? "button" : undefined}
              aria-pressed={isTouch ? hovered === idx : undefined}
              tabIndex={isTouch ? 0 : -1}
              onKeyDown={(e) => {
                if (!isTouch) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setHovered((v) => (v === idx ? null : idx));
                }
              }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.src}
                  alt={it.title}
                  className="h-full w-full object-cover object-[50%_18%] sm:object-center transition-transform duration-700 ease-out group-hover:scale-[1.075]"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.dataset.fallbackApplied) return;
                    img.dataset.fallbackApplied = "1";
                    img.src = fallbackSrc;
                  }}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute bottom-0 left-0 h-[70%] w-full"
                  blurIntensity={0.6}
                  animate={hovered === idx ? "visible" : "hidden"}
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(60% 55% at 50% 35%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)",
                  }}
                />

                {/* Mobile preview overlay (tap-to-toggle). */}
                {isTouch ? (
                  <motion.div
                    className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white"
                    animate={hovered === idx ? "visible" : "hidden"}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className="space-y-2">
                      <div className="inline-flex max-w-full rounded-lg bg-white/10 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/20 backdrop-blur">
                        {it.title}
                      </div>
                      {it.subtitle ? (
                        <p className="line-clamp-2 text-sm text-white/85">{it.subtitle}</p>
                      ) : null}
                      {(it.priceLabel || it.ratingLabel) ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {it.priceLabel ? (
                            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-900 shadow">
                              {it.priceLabel}
                            </span>
                          ) : null}
                          {it.ratingLabel ? (
                            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
                              {it.ratingLabel}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}

                {it.badge ? (
                  <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#c9a227] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm ring-1 ring-black/10">
                    {it.badge}
                  </div>
                ) : null}
              </div>

              <div className="p-4 sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-base font-bold text-neutral-900">{it.title}</h3>
                  {it.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{it.subtitle}</p>
                  ) : null}
                </div>

                {(it.priceLabel || it.ratingLabel) ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {it.priceLabel ? (
                      <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        {it.priceLabel}
                      </span>
                    ) : null}
                    {it.ratingLabel ? (
                      <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 ring-1 ring-black/5 shadow-[0_6px_16px_-12px_rgba(0,0,0,0.35)]">
                        {it.ratingLabel}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImageGallery;
