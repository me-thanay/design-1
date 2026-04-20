"use client";

import { cn } from "@/lib/utils";

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
  return (
    <section className={cn("w-full py-10 sm:py-14", className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">{subtitle}</p>
        </div>

        {/* Horizontal scroll keeps the layout stable (no reflow on hover). */}
        <div className="no-scrollbar mt-8 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:px-0">
          {items.slice(0, 10).map((it, idx) => (
            <article
              key={`${it.title}-${idx}`}
              className={cn(
                "group relative shrink-0 overflow-hidden rounded-3xl bg-white",
                "w-[min(82vw,280px)] sm:w-[260px] md:w-[280px]",
                "ring-1 ring-black/10 shadow-sm",
                "transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl",
              )}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.src}
                  alt={it.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                {it.badge ? (
                  <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#c9a227] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                    {it.badge}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2 p-4">
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-base font-bold text-neutral-900">
                    {it.title}
                  </h3>
                  {it.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                      {it.subtitle}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {it.priceLabel ? (
                      <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold text-white">
                        {it.priceLabel}
                      </span>
                    ) : null}
                    {it.ratingLabel ? (
                      <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 ring-1 ring-black/5">
                        {it.ratingLabel}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50"
                  >
                    View
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImageGallery;
