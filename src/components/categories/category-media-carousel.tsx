"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCROLL_REVEAL_EASE } from "@/components/motion/scroll-reveal";

export type CategoryCarouselSlide = {
  src: string;
  alt: string;
  /** Large line on the image (e.g. "FESTIVE SILK EDITS") */
  title: string;
};

type CategoryMediaCarouselProps = {
  eyebrow?: string;
  slides: CategoryCarouselSlide[];
  className?: string;
};

export function CategoryMediaCarousel({
  eyebrow = "Media spotlight",
  slides,
  className,
}: CategoryMediaCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const total = slides.length;
  const safeTotal = Math.max(1, total);
  /** Browser interval id (number); avoid NodeJS.Timeout vs number merge issues. */
  const autoplayRef = React.useRef<number | null>(null);

  const slidesKey = React.useMemo(() => slides.map((s) => s.src).join("|"), [slides]);

  React.useEffect(() => {
    setIndex(0);
  }, [slidesKey]);

  const clearAutoplay = React.useCallback(() => {
    const id = autoplayRef.current;
    if (id !== null) {
      window.clearInterval(id);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = React.useCallback(() => {
    clearAutoplay();
    if (slides.length <= 1) return;
    autoplayRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000) as unknown as number;
  }, [clearAutoplay, slides.length]);

  React.useEffect(() => {
    startAutoplay();
    return clearAutoplay;
  }, [startAutoplay, clearAutoplay]);

  const go = (dir: -1 | 1) => {
    if (slides.length <= 1) return;
    setIndex((i) => (i + dir + slides.length) % slides.length);
    startAutoplay();
  };

  const current = slides[index] ?? slides[0];

  if (!current) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[1.75rem] ring-1 ring-black/10 shadow-2xl sm:rounded-3xl",
        className,
      )}
    >
      {/* One aspect ratio everywhere so every slide frames the same; avoids jumpy layout between images. */}
      <div className="relative aspect-[16/10] w-full min-h-[260px] sm:min-h-[300px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`${index}-${current.src}`}
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-neutral-200"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: SCROLL_REVEAL_EASE }}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              className="object-cover"
              style={{ objectPosition: "center center" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1152px) 90vw, 1152px"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Full-frame tint for legibility; bottom band reserved for type + counter. */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-8 pt-0 sm:px-10 sm:pb-10 md:px-12 md:pb-12">
          <div className="mx-auto w-full max-w-6xl text-left">
            {/* Eyebrow: sans, fixed metrics so it stacks flush with the title block below. */}
            <p className="m-0 font-sans text-[10px] font-semibold uppercase leading-normal tracking-[0.28em] text-white/90 sm:text-xs">
              {eyebrow}
            </p>
            {/* Title + counter share one row; items-end aligns serif cap height with the counter. */}
            <div className="mt-2 flex items-end justify-between gap-6 sm:mt-2.5 sm:gap-8 md:gap-10">
              <h2 className="m-0 min-w-0 max-w-[min(100%,28rem)] font-serif text-2xl font-semibold uppercase leading-[1.1] tracking-wide text-white sm:text-3xl md:text-4xl">
                {current.title}
              </h2>
              <p className="m-0 shrink-0 font-sans text-sm font-medium tabular-nums leading-none tracking-normal text-white sm:text-base">
                {String(index + 1).padStart(2, "0")} / {String(safeTotal).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>

        {total > 1 ? (
          <>
            <motion.button
              type="button"
              aria-label="Previous slide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(-1);
              }}
              className={cn(
                "absolute left-4 top-[44%] z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/15 text-white shadow-lg outline-none backdrop-blur-md ring-1 ring-white/25 hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 sm:left-6 sm:h-12 sm:w-12 md:left-8",
              )}
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            >
              <ChevronLeft className="pointer-events-none h-6 w-6 shrink-0" aria-hidden />
            </motion.button>
            <motion.button
              type="button"
              aria-label="Next slide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(1);
              }}
              className={cn(
                "absolute right-4 top-[44%] z-30 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-white/15 text-white shadow-lg outline-none backdrop-blur-md ring-1 ring-white/25 hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/60 sm:right-6 sm:h-12 sm:w-12 md:right-8",
              )}
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            >
              <ChevronRight className="pointer-events-none h-6 w-6 shrink-0" aria-hidden />
            </motion.button>
          </>
        ) : null}
      </div>
    </div>
  );
}
