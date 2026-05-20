"use client";

import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { ProductCartControl } from "@/components/cart/product-cart-control";
import type { Product } from "@/lib/products";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

export type ImageGalleryItem = {
  src: string;
  imageSources?: string[];
  title: string;
  subtitle?: string;
  badge?: string;
  priceLabel?: string;
  ratingLabel?: string;
  /** Optional CSS object-position (e.g. "50% 16%") for better subject framing. */
  imagePosition?: string;
  /** Optional fit override for the image (default: cover). */
  imageFit?: "cover" | "contain";
  /** When provided, renders an add-to-cart control in the card. */
  product?: Product;
  /** Optional image to store in cart (defaults to `src`). */
  cartImage?: string;
};

export type ImageGalleryProps = {
  title?: string | null;
  subtitle?: string | null;
  items: ImageGalleryItem[];
  className?: string;
  /** Optional click handler for "View details". */
  onItemClick?: (item: ImageGalleryItem) => void;
  /** Wrapper around header + scroller (defaults to centered max-width container). */
  containerClassName?: string;
  /** Header alignment (defaults to centered). */
  headerAlign?: "center" | "left";
  /** Limit number of cards rendered (defaults to 10). */
  maxItems?: number;
};

export function ImageGallery({
  title,
  subtitle,
  items,
  className,
  onItemClick,
  containerClassName = "mx-auto max-w-6xl px-4",
  headerAlign = "center",
  maxItems = 10,
}: ImageGalleryProps) {
  const resolvedTitle =
    title === undefined ? "Best sellers in detail" : title;
  const resolvedSubtitle =
    subtitle === undefined
      ? "Hover a card to preview — then browse the collection."
      : subtitle;
  const [hovered, setHovered] = React.useState<number | null>(null);
  const fallbackSrc = "/stock_images/banarasi%20silk.jpeg";
  const [isTouch, setIsTouch] = React.useState(false);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const dragRef = React.useRef<{
    active: boolean;
    pending: boolean;
    moved: boolean;
    startX: number;
    startLeft: number;
    lastEndAt: number;
    pointerId: number | null;
  }>({
    active: false,
    pending: false,
    moved: false,
    startX: 0,
    startLeft: 0,
    lastEndAt: 0,
    pointerId: null,
  });
  const [activeImageIndexes, setActiveImageIndexes] = React.useState<Record<number, number>>(
    {},
  );
  const [lastUserInteractionAt, setLastUserInteractionAt] = React.useState<Record<number, number>>(
    {},
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(Boolean(mq.matches));
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Make mouse-wheel scrolling move the horizontal scroller.
  // Must be a non-passive listener to allow preventDefault without console warnings.
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Trackpads often provide deltaX; for mouse wheels use deltaY.
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, []);

  // Auto-cycle images for a lively gallery feel.
  // Pauses briefly after user interaction, and while a card is hovered (desktop).
  React.useEffect(() => {
    const slice = items.slice(0, Math.max(1, maxItems));
    if (slice.length === 0) return;

    const intervalMs = 2800;
    const pauseAfterInteractionMs = 7000;

    const id = window.setInterval(() => {
      const now = Date.now();
      setActiveImageIndexes((prev) => {
        let next = prev;
        for (let idx = 0; idx < slice.length; idx++) {
          const it = slice[idx];
          const imageSources = [
            ...(it.imageSources ?? []),
            it.src,
          ]
            .map((s) => String(s || "").trim())
            .filter(Boolean)
            .filter((s, imageIdx, arr) => arr.indexOf(s) === imageIdx);
          if (imageSources.length <= 1) continue;

          // Don't fight user intent.
          if (hovered === idx) continue;
          const last = lastUserInteractionAt[idx] ?? 0;
          if (now - last < pauseAfterInteractionMs) continue;

          const current = prev[idx] ?? 0;
          const advanced = (current + 1) % imageSources.length;
          if (next === prev) next = { ...prev };
          next[idx] = advanced;
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [items, maxItems, hovered, lastUserInteractionAt]);

  return (
    <section className={cn("w-full py-10 sm:py-14", className)}>
      <div className={cn(containerClassName)}>
        {Boolean(resolvedTitle?.trim?.() || resolvedSubtitle?.trim?.()) ? (
          <div
            className={cn(
              "mx-auto max-w-3xl",
              headerAlign === "center" ? "text-center" : "text-left",
              headerAlign === "left" ? "mx-0" : null,
            )}
          >
            {resolvedTitle ? (
              <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                {resolvedTitle}
              </h2>
            ) : null}
            {resolvedSubtitle ? (
              <p className="mt-2 text-sm text-neutral-600 sm:text-base">
                {resolvedSubtitle}
              </p>
            ) : null}
            {isTouch ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Tap a card to preview
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Wrapping layout (no horizontal scroll). */}
        <div
          ref={scrollerRef}
          className={cn(
            // Wrap cards onto next line on ALL screen sizes.
            "no-scrollbar -mx-4 flex flex-wrap justify-center gap-4 overflow-x-visible px-4 pb-3 pt-1 sm:mx-0 sm:justify-start sm:px-0 sm:gap-6",
            "select-none",
            Boolean(resolvedTitle?.trim?.() || resolvedSubtitle?.trim?.()) ? "mt-6 sm:mt-8" : "mt-0",
          )}
          style={{
            touchAction: "pan-y",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          {items.slice(0, Math.max(1, maxItems)).map((it, idx) => (
            (() => {
              const clickable = Boolean(onItemClick && it.product);
              const imageSources = [
                ...(it.imageSources ?? []),
                it.src,
              ]
                .map((src) => String(src || "").trim())
                .filter(Boolean)
                .filter((src, imageIdx, arr) => arr.indexOf(src) === imageIdx);
              const activeImageIdx = activeImageIndexes[idx] ?? 0;
              const activeSrc =
                imageSources[activeImageIdx] ?? imageSources[0] ?? it.src;
              return (
                <motion.article
                  key={`${it.title}-${idx}`}
                  className={cn(
                    "group relative shrink-0 overflow-hidden rounded-3xl bg-white",
                    // Responsive wrapping card width.
                    "w-full max-w-[340px] flex-[1_1_260px]",
                    "ring-1 ring-black/10 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]",
                    "transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-22px_rgba(0,0,0,0.45)]",
                    clickable ? "cursor-pointer" : null,
                  )}
                  onHoverStart={() => setHovered(idx)}
                  onHoverEnd={() => setHovered((v) => (v === idx ? null : v))}
                  onClick={() => {
                    // If this was a drag-to-scroll gesture, don't treat it as a click.
                    if (Date.now() - dragRef.current.lastEndAt < 240) return;
                    if (clickable) {
                      onItemClick?.(it);
                      return;
                    }
                    if (!isTouch) return;
                    setHovered((v) => (v === idx ? null : idx));
                  }}
                  whileTap={isTouch ? { scale: 0.98 } : undefined}
                  role={clickable || isTouch ? "button" : undefined}
                  aria-pressed={!clickable && isTouch ? hovered === idx : undefined}
                  tabIndex={clickable || isTouch ? 0 : -1}
                  onKeyDown={(e) => {
                    if (clickable) {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onItemClick?.(it);
                      }
                      return;
                    }
                    if (!isTouch) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setHovered((v) => (v === idx ? null : idx));
                    }
                  }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                    {it.imageFit === "contain" ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeSrc}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover scale-[1.08] blur-2xl opacity-60"
                          style={{ objectPosition: it.imagePosition ?? "50% 18%" }}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-white/25" aria-hidden="true" />
                      </>
                    ) : null}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeSrc}
                        src={activeSrc}
                        alt={it.title}
                        className={[
                          "absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.075]",
                          it.imageFit === "contain" ? "object-contain" : "object-cover",
                          "sm:object-center",
                        ].join(" ")}
                        style={{ objectPosition: it.imagePosition ?? "50% 18%" }}
                        loading="lazy"
                        decoding="async"
                        initial={{ opacity: 0, scale: 1.04, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.02, filter: "blur(3px)" }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (img.dataset.fallbackApplied) return;
                          img.dataset.fallbackApplied = "1";
                          img.src = fallbackSrc;
                        }}
                      />
                    </AnimatePresence>
                    {imageSources.length > 1 ? (
                      <>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
                        <div className="absolute inset-x-0 bottom-3 z-[1] px-3">
                          <div className="no-scrollbar flex items-center justify-center gap-2 overflow-x-auto pb-1">
                            {imageSources.map((src, imageIdx) => (
                              <button
                                key={`${src}-${imageIdx}`}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setLastUserInteractionAt((prev) => ({
                                    ...prev,
                                    [idx]: Date.now(),
                                  }));
                                  setActiveImageIndexes((prev) => ({
                                    ...prev,
                                    [idx]: imageIdx,
                                  }));
                                }}
                                className={cn(
                                  "relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border transition duration-200",
                                  imageIdx === activeImageIdx
                                    ? "scale-105 border-white shadow-lg ring-2 ring-white/70"
                                    : "border-white/40 opacity-80 hover:opacity-100 hover:border-white/70",
                                )}
                                aria-label={`Show image ${imageIdx + 1}`}
                                title={`Image ${imageIdx + 1}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt=""
                                  aria-hidden="true"
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                                {imageIdx !== activeImageIdx ? (
                                  <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
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
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#c9a227] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm ring-1 ring-black/10"
                      >
                        {it.badge}
                      </motion.div>
                    ) : null}
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-base font-bold text-neutral-900">{it.title}</h3>
                      {it.subtitle ? (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{it.subtitle}</p>
                      ) : null}
                    </div>

                    {it.product && (it.product.colors?.length || it.product.sizes?.length) ? (
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-neutral-700">
                        {it.product.colors?.length ? (
                          <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 ring-1 ring-black/5">
                            Colors: {it.product.colors.slice(0, 3).join(", ")}
                            {it.product.colors.length > 3 ? "…" : ""}
                          </span>
                        ) : null}
                        {it.product.sizes?.length ? (
                          <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 ring-1 ring-black/5">
                            Sizes: {it.product.sizes.slice(0, 4).join(", ")}
                            {it.product.sizes.length > 4 ? "…" : ""}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

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

                    {it.product ? (
                      <div className="mt-3 space-y-2">
                        {/* Card itself opens details when `onItemClick` is provided. */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <ProductCartControl
                            product={it.product}
                            image={imageSources[activeImageIdx] ?? it.cartImage ?? it.src}
                            tone="card"
                            compact
                            onSelectOptions={() => onItemClick?.(it)}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              );
            })()
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImageGallery;
