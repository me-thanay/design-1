"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CategoryHeroProps = {
  title: string;
  subtitle: string;
  images: string[];
  imagePositions?: string[];
  shopHref?: string;
  breadcrumbs?: { label: string; href: string }[];
  className?: string;
  intervalMs?: number;
  fadeMs?: number;
};

export function CategoryHero({
  title,
  subtitle,
  images,
  imagePositions,
  shopHref = "/#shop",
  breadcrumbs = [
    { label: "← Home", href: "/" },
    { label: "All categories", href: "/#categories" },
  ],
  className,
  intervalMs = 4500,
  fadeMs = 900,
}: CategoryHeroProps) {
  const safeImages = React.useMemo(() => images.filter(Boolean), [images]);
  const [bgIndex, setBgIndex] = React.useState(0);

  React.useEffect(() => {
    if (safeImages.length <= 1) return;
    const t = window.setInterval(() => {
      setBgIndex((i) => (i + 1) % safeImages.length);
    }, Math.max(1500, intervalMs));
    return () => window.clearInterval(t);
  }, [intervalMs, safeImages.length]);

  return (
    <section
      className={cn(
        "relative isolate w-full overflow-hidden",
        "min-h-[72svh] sm:min-h-[64svh]",
        "flex items-end",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {safeImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={[
              "absolute inset-0 bg-center bg-cover will-change-transform will-change-opacity",
              "transition-[opacity,transform] motion-reduce:transition-none",
              index === (bgIndex % safeImages.length) ? "opacity-100 scale-[1.06]" : "opacity-0 scale-[1.03]",
            ].join(" ")}
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: imagePositions?.[index] ?? undefined,
              transitionDuration: `${Math.max(0, fadeMs)}ms`,
              filter: "saturate(1.06) contrast(1.06)",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/70" />
      </div>

      <div className="w-full">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-20 sm:pb-14 sm:pt-24">
          <div className="flex flex-wrap items-center gap-3">
            {breadcrumbs.map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15 hover:text-white"
              >
                {b.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                Category
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/80 drop-shadow-[0_10px_28px_rgba(0,0,0,0.45)] sm:text-base">
                {subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={shopHref}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-white/90"
              >
                Shop now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

