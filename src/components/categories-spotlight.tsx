"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CategorySlide = {
  slug: "sarees" | "blouses" | "kurtis" | "gowns";
  eyebrow: string;
  title: string;
  subtitle: string;
  imageSrc: string;
};

const SLIDES: CategorySlide[] = [
  {
    slug: "sarees",
    eyebrow: "Categories",
    title: "Festive silk edits",
    subtitle: "Banarasi · modal · organza · linen",
    imageSrc: "/stock_images/banarasi%20silk.jpeg",
  },
  {
    slug: "blouses",
    eyebrow: "Categories",
    title: "Blouse essentials",
    subtitle: "Party wear · cotton · silk · ajrakh",
    imageSrc: "/stock_images/PARTY%20WEAR%20BLOUSE.jpeg",
  },
  {
    slug: "kurtis",
    eyebrow: "Categories",
    title: "Everyday kurtis",
    subtitle: "Cotton · rayon · georgette",
    imageSrc: "/stock_images/COTTON%20KURTI.jpeg",
  },
  {
    slug: "gowns",
    eyebrow: "Categories",
    title: "Gown spotlight",
    subtitle: "Party · casual · flowy silhouettes",
    imageSrc: "/stock_images/PARTY%20WEAR%20GOWN.jpeg",
  },
];

export default function CategoriesSpotlight({
  className,
}: {
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const slide = SLIDES[index];

  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setIndex((i) => (i + 1) % SLIDES.length);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative overflow-hidden rounded-[2.25rem] ring-1 ring-black/10">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.imageSrc}
          alt=""
          className="h-[360px] w-full object-cover sm:h-[420px] lg:h-[520px]"
          loading="lazy"
          decoding="async"
        />

        {/* Overlay (must not block clicks) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/70" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
            {slide.eyebrow}
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {slide.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
            {slide.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/categories/${slide.slug}`}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-white/90"
            >
              Explore {slide.slug} →
            </Link>

            <div className="flex items-center gap-3 text-xs text-white/70">
              <span>
                {String(index + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous"
          onClick={prev}
          className={cn(
            buttonVariants({ variant: "secondary", size: "icon" }),
            "absolute left-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-black/35 text-white ring-1 ring-white/15 backdrop-blur hover:bg-black/45 pointer-events-auto",
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className={cn(
            buttonVariants({ variant: "secondary", size: "icon" }),
            "absolute right-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-black/35 text-white ring-1 ring-white/15 backdrop-blur hover:bg-black/45 pointer-events-auto",
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-9 bg-neutral-900/70" : "w-3 bg-neutral-400/50 hover:bg-neutral-500/60",
            )}
          />
        ))}
      </div>
    </div>
  );
}

