"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { defaultRevealViewport, SCROLL_REVEAL_EASE } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

// --- TYPES ---
type HeroProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> & {
  title: React.ReactNode;
  subtitle: string;
  images: {
    src: string;
    alt: string;
    meta?: {
      badge?: string;
      price?: string;
      ratingText?: string;
    };
  }[];
  tone?: "dark" | "light";
  eyebrow?: string;
  onSlideChange?: (index: number) => void;
  aside?: React.ReactNode;
};

/** Horizontal offset between carousel steps (px) — keep modest so slides don’t bleed into the aside */
const SLIDE_SHIFT_PX = 96;

// --- HERO SECTION COMPONENT ---
export const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      title,
      subtitle,
      images,
      tone = "dark",
      eyebrow = "Media spotlight",
      onSlideChange,
      aside,
      className,
      ...props
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const [currentIndex, setCurrentIndex] = React.useState(Math.floor(images.length / 2));

    const handleNext = React.useCallback(() => {
      if (images.length === 0) return;
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    const handlePrev = React.useCallback(() => {
      if (images.length === 0) return;
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }, [images.length]);

    React.useEffect(() => {
      if (images.length <= 1) return;
      const timer = window.setInterval(handleNext, 4500);
      return () => window.clearInterval(timer);
    }, [handleNext, images.length]);

    React.useEffect(() => {
      if (!onSlideChange) return;
      onSlideChange(currentIndex);
    }, [currentIndex, onSlideChange]);

    const slideTransition = reduceMotion
      ? { duration: 0 }
      : { type: "spring" as const, stiffness: 280, damping: 32, mass: 0.85 };

    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden text-foreground", className)}
        {...props}
      >
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
          <div className="mx-auto flex w-full flex-col items-center text-center">
            <motion.div
              className="space-y-3"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, ...defaultRevealViewport }}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease: SCROLL_REVEAL_EASE }}
            >
              {eyebrow ? (
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-[0.22em]",
                    tone === "dark" ? "text-neutral-400" : "text-neutral-500",
                  )}
                >
                  {eyebrow}
                </p>
              ) : null}
              <h2
                className={cn(
                  "text-3xl font-semibold tracking-tight sm:text-4xl",
                  tone === "dark" ? "text-white" : "text-neutral-900",
                )}
              >
                {title}
              </h2>
              <p
                className={cn(
                  "mx-auto max-w-2xl text-sm sm:text-base",
                  tone === "dark" ? "text-white/70" : "text-neutral-600",
                )}
              >
                {subtitle}
              </p>
            </motion.div>

            <div
              className={cn(
                "relative mt-8 w-full sm:mt-10",
                aside ? "max-w-6xl" : "",
              )}
            >
              <div
                className={cn(
                  aside
                    ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-10"
                    : "",
                )}
              >
                {/* Carousel column: min-w-0 + overflow-hidden prevents overlap into aside */}
                <div className={cn(aside ? "min-w-0 overflow-hidden" : "")}>
                  <div className="relative mx-auto w-full max-w-[min(100%,680px)]">
                    <div
                      className="relative mx-auto h-[320px] w-full sm:h-[380px] md:h-[400px]"
                      style={{ perspective: reduceMotion ? undefined : 1100 }}
                    >
                      <div className="relative h-full w-full">
                        {images.map((image, index) => {
                          const offset = index - currentIndex;
                          const total = images.length;
                          let pos = (offset + total) % total;
                          if (pos > Math.floor(total / 2)) pos -= total;

                          const isCenter = pos === 0;
                          const isAdjacent = Math.abs(pos) === 1;
                          const hidden = Math.abs(pos) > 1;

                          return (
                            <div
                              // eslint-disable-next-line react/no-array-index-key
                              key={`${image.src}-${index}`}
                              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                              style={{ zIndex: isCenter ? 10 : isAdjacent ? 5 : 1 }}
                            >
                              <motion.div
                                className="pointer-events-auto will-change-transform"
                                style={{ transformStyle: "preserve-3d" }}
                                initial={false}
                                animate={
                                  reduceMotion
                                    ? {
                                        x: hidden ? 0 : pos * SLIDE_SHIFT_PX,
                                        scale: hidden ? 0.85 : isCenter ? 1 : isAdjacent ? 0.88 : 0.75,
                                        rotateY: 0,
                                        opacity: hidden ? 0 : isCenter ? 1 : isAdjacent ? 0.4 : 0.15,
                                        filter: hidden ? "blur(8px)" : isCenter ? "blur(0px)" : "blur(8px)",
                                      }
                                    : {
                                        x: pos * SLIDE_SHIFT_PX,
                                        scale: hidden ? 0.72 : isCenter ? 1 : isAdjacent ? 0.88 : 0.72,
                                        rotateY: hidden ? 0 : pos * -9,
                                        opacity: hidden ? 0 : isCenter ? 1 : isAdjacent ? 0.38 : 0,
                                        filter: hidden ? "blur(8px)" : isCenter ? "blur(0px)" : "blur(7px)",
                                      }
                                }
                                transition={slideTransition}
                              >
                                <motion.div
                                  className="relative h-[300px] w-[200px] overflow-hidden rounded-[1.75rem] ring-1 ring-black/10 shadow-xl sm:h-[360px] sm:w-[230px] md:h-[380px] md:w-[240px]"
                                  whileHover={
                                    reduceMotion || !isCenter
                                      ? undefined
                                      : { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 22 } }
                                  }
                                >
                                  {isCenter ? (
                                    <motion.img
                                      key={currentIndex}
                                      src={image.src}
                                      alt={image.alt}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                      referrerPolicy="no-referrer"
                                      initial={reduceMotion ? false : { opacity: 0.88, scale: 1.04 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: reduceMotion ? 0 : 0.42, ease: SCROLL_REVEAL_EASE }}
                                    />
                                  ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={image.src}
                                      alt={image.alt}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                <div
                                  className={cn(
                                    "pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent",
                                    tone === "dark" ? "from-black/40" : "from-black/25",
                                  )}
                                />
                                {isCenter && image.meta ? (
                                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4">
                                    <div className="flex items-end justify-between gap-3">
                                      <div className="min-w-0">
                                        {image.meta.badge ? (
                                          <div className="inline-flex rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/20 backdrop-blur">
                                            {image.meta.badge}
                                          </div>
                                        ) : null}
                                        {(image.meta.price || image.meta.ratingText) && (
                                          <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {image.meta.price ? (
                                              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 ring-1 ring-black/10">
                                                {image.meta.price}
                                              </span>
                                            ) : null}
                                            {image.meta.ratingText ? (
                                              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                                                {image.meta.ratingText}
                                              </span>
                                            ) : null}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : null}
                                </motion.div>
                              </motion.div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      aria-label="Previous"
                      onClick={handlePrev}
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "icon" }),
                        "absolute left-1 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full backdrop-blur",
                        tone === "dark"
                          ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15"
                          : "bg-white/90 text-neutral-900 ring-1 ring-black/10 shadow-sm hover:bg-white",
                        "sm:left-2",
                      )}
                      whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      type="button"
                      aria-label="Next"
                      onClick={handleNext}
                      className={cn(
                        buttonVariants({ variant: "secondary", size: "icon" }),
                        "absolute right-1 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full backdrop-blur",
                        tone === "dark"
                          ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15"
                          : "bg-white/90 text-neutral-900 ring-1 ring-black/10 shadow-sm hover:bg-white",
                        "sm:right-2",
                      )}
                      whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-2">
                    {images.map((_, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => setCurrentIndex(i)}
                        className={cn(
                          "h-1.5 rounded-full",
                          tone === "dark"
                            ? i === currentIndex
                              ? "bg-white/85"
                              : "bg-white/25 hover:bg-white/40"
                            : i === currentIndex
                              ? "bg-neutral-900/75"
                              : "bg-neutral-400/55 hover:bg-neutral-500/75",
                        )}
                        animate={{
                          width: i === currentIndex ? 32 : 12,
                          opacity: i === currentIndex ? 1 : 0.75,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        whileHover={reduceMotion ? undefined : { scale: 1.15 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                      />
                    ))}
                  </div>
                </div>

                {aside ? (
                  <aside className="relative z-20 mx-auto w-full max-w-[740px] shrink-0 lg:mx-0 lg:max-w-none lg:pt-1">
                    {aside}
                  </aside>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

HeroSection.displayName = "HeroSection";
