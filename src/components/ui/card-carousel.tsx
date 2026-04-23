"use client";

import * as React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { Sparkles } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Badge } from "@/components/ui/badge";
import { ProductCartControl } from "@/components/cart/product-cart-control";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export type BestSellerCarouselProductSlide = {
  kind: "product";
  product: Product;
  imageSrc: string;
  badge: string;
};

export type BestSellerCarouselShowcaseSlide = {
  kind: "showcase";
  title: string;
  description: string;
  imageSrc: string;
  badge: string;
  priceLabel: string;
  ratingLabel: string;
  href: string;
};

export type BestSellerCarouselSlide = BestSellerCarouselProductSlide | BestSellerCarouselShowcaseSlide;

export type BestSellerCardCarouselProps = {
  slides: BestSellerCarouselSlide[];
  title?: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
  className?: string;
};

function blurbFromProduct(p: Product) {
  const d = p.description?.trim();
  if (d) return d.length > 160 ? `${d.slice(0, 160)}…` : d;
  return `${p.subcategory ?? "Premium"} · curated in-store quality.`;
}

/** Enough slides for Swiper loop + coverflow so edges stay filled without blank gutters. */
function expandSlidesForLoop(slides: BestSellerCarouselSlide[], minSlides = 14) {
  if (!slides.length) return [] as { slide: BestSellerCarouselSlide; reactKey: string }[];
  const out: { slide: BestSellerCarouselSlide; reactKey: string }[] = [];
  const target = Math.max(minSlides, slides.length * 3);
  for (let i = 0; i < target; i++) {
    const slide = slides[i % slides.length];
    const base =
      slide.kind === "product" ? `p-${slide.product.id}` : `s-${slide.title.replace(/\s+/g, "-")}`;
    out.push({ slide, reactKey: `${base}-${i}` });
  }
  return out;
}

export function BestSellerCardCarousel({
  slides,
  title,
  subtitle = "Swipe through top-rated pieces — price, rating, and one-tap add to cart.",
  eyebrow = "Featured",
  autoplayDelay = 2200,
  showPagination = true,
  showNavigation = true,
  className,
}: BestSellerCardCarouselProps) {
  const loopSlides = React.useMemo(() => expandSlidesForLoop(slides), [slides]);
  const loopEnabled = loopSlides.length >= 3;

  const defaultTitle = (
    <>
      Best <span className="text-[#f5c97a]">sellers</span>
    </>
  );

  if (!slides.length) {
    return null;
  }

  return (
    <section className={cn("w-full space-y-6", className)}>
      <style>{`
        .home-bs-swiper.swiper {
          width: 100%;
          padding: 8px 0 48px;
          overflow: visible;
        }
        .home-bs-swiper .swiper-wrapper { align-items: stretch; }
        .home-bs-swiper .swiper-slide {
          width: clamp(260px, 26vw, 320px);
          height: auto;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
        }
        .home-bs-swiper .swiper-slide .home-bs-card {
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
        }
        .home-bs-swiper .swiper-slide:hover .home-bs-card { transform: translateY(-3px); }
        .home-bs-swiper .swiper-slide-active .home-bs-card {
          box-shadow: 0 24px 44px -16px rgba(0,0,0,0.35);
        }
        .home-bs-swiper .swiper-slide .home-bs-card-img {
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .home-bs-swiper .swiper-slide:hover .home-bs-card-img {
          transform: scale(1.03);
        }
        .home-bs-swiper .swiper-3d .swiper-slide-shadow-left,
        .home-bs-swiper .swiper-3d .swiper-slide-shadow-right {
          background: rgba(0,0,0,0.10);
        }
        .home-bs-swiper .swiper-button-prev,
        .home-bs-swiper .swiper-button-next {
          color: rgb(23 23 23);
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.92);
          border-radius: 9999px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.2s ease;
        }
        .home-bs-swiper .swiper-button-prev:hover,
        .home-bs-swiper .swiper-button-next:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 28px rgba(0,0,0,0.18);
          background: rgb(255 255 255);
        }
        .home-bs-swiper .swiper-button-prev::after,
        .home-bs-swiper .swiper-button-next::after { font-size: 17px; font-weight: 800; }
        .home-bs-swiper .swiper-pagination-bullet {
          background: rgb(163 163 163);
          opacity: 0.55;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .home-bs-swiper .swiper-pagination-bullet-active {
          background: rgb(23 23 23);
          opacity: 1;
          transform: scale(1.15);
        }
      `}</style>

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Badge
          variant="outline"
          className="mb-3 inline-flex gap-1.5 rounded-full border-black/10 bg-white/95 px-3 py-1 text-xs font-semibold shadow-sm sm:text-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#c9a227]" aria-hidden />
          Best sellers
        </Badge>

        <div className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
          <h3 className="mt-2 font-serif text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.65rem] md:leading-tight">
            {title ?? defaultTitle}
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600 md:mx-0">{subtitle}</p>
        </div>
      </div>

      {/* Full-bleed track: fills viewport so coverflow never shows empty left/right gutters */}
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-hidden overflow-y-visible px-0 sm:px-2">
        <div className="relative mx-auto max-w-[100vw] px-2 sm:px-12 md:px-16">
          {showNavigation && loopSlides.length > 1 ? (
            <>
              <div className="swiper-button-prev home-bs-prev !left-1 !top-1/2 !-translate-y-1/2 z-20 sm:!left-3 md:!left-6" />
              <div className="swiper-button-next home-bs-next !right-1 !top-1/2 !-translate-y-1/2 z-20 sm:!right-3 md:!right-6" />
            </>
          ) : null}

          <Swiper
            className="home-bs-swiper !overflow-visible"
            spaceBetween={26}
            speed={650}
            autoplay={
              loopEnabled
                ? {
                    delay: autoplayDelay,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            effect="coverflow"
            grabCursor
            centeredSlides
            loop={loopEnabled}
            loopAdditionalSlides={6}
            watchSlidesProgress
            slidesPerView="auto"
            coverflowEffect={{ rotate: 0, stretch: 10, depth: 80, modifier: 0.85, slideShadows: false }}
            pagination={
              showPagination
                ? {
                    clickable: true,
                    dynamicBullets: true,
                  }
                : false
            }
            navigation={
              showNavigation && loopSlides.length > 1
                ? {
                    prevEl: ".home-bs-prev",
                    nextEl: ".home-bs-next",
                  }
                : undefined
            }
            modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          >
            {loopSlides.map(({ slide, reactKey }) => (
              <SwiperSlide key={reactKey}>
                <article className="home-bs-card flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl bg-neutral-900 shadow-lg ring-1 ring-black/15">
                  <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-neutral-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.imageSrc}
                      alt={slide.kind === "product" ? slide.product.name : slide.title}
                      className="home-bs-card-img h-full w-full object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 86vw, 340px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    <span className="absolute left-3 top-3 z-[1] rounded-full bg-[#c9a227] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-md sm:left-4 sm:top-4 sm:text-[11px]">
                      {slide.badge}
                    </span>

                    <div className="absolute bottom-0 left-0 right-0 space-y-2.5 p-4 text-left text-white sm:p-5">
                        {slide.kind === "product" ? (
                          <>
                            <h4 className="inline-flex max-w-full rounded-lg bg-[#c9a227]/35 px-2.5 py-1 text-sm font-bold leading-snug text-white ring-1 ring-[#c9a227]/55 sm:text-base">
                              {slide.product.name}
                            </h4>
                            <p className="line-clamp-2 text-xs leading-relaxed text-white/85 sm:text-sm">
                              {blurbFromProduct(slide.product)}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                              <span className="inline-flex rounded-md bg-white px-2 py-1 text-sm font-bold tabular-nums text-neutral-900 shadow sm:text-base">
                                ₹{Math.round(slide.product.price).toLocaleString("en-IN")}
                              </span>
                              <span className="font-semibold text-white">{slide.product.rating.toFixed(1)}★</span>
                              {slide.product.subcategory ? (
                                <span className="text-white/70">· {slide.product.subcategory}</span>
                              ) : null}
                            </div>
                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                              <ProductCartControl
                                product={slide.product}
                                image={slide.imageSrc}
                                tone="onImage"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="inline-flex max-w-full rounded-lg bg-white/15 px-2.5 py-1 text-sm font-bold text-white ring-1 ring-white/25 sm:text-base">
                              {slide.title}
                            </h4>
                            <p className="line-clamp-2 text-xs text-white/85 sm:text-sm">{slide.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                              <span className="inline-flex rounded-md bg-white px-2 py-1 font-bold text-neutral-900 shadow">
                                {slide.priceLabel}
                              </span>
                              <span className="text-white/90">{slide.ratingLabel}</span>
                            </div>
                            <Link
                              href={slide.href}
                              className="inline-flex h-9 w-full items-center justify-center rounded-full bg-white text-sm font-semibold text-neutral-900 shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-100 hover:shadow-lg active:scale-[0.99]"
                            >
                              Shop this look
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
        </div>
      </div>
    </section>
  );
}

/** Generic image-only carousel (original demo shape) — optional for marketing pages. */
export type CardCarouselImage = { src: string; alt: string };

export type CardCarouselProps = {
  images: CardCarouselImage[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
};

export function CardCarousel({
  images,
  autoplayDelay = 1800,
  showPagination = true,
  showNavigation = true,
}: CardCarouselProps) {
  const slides: BestSellerCarouselSlide[] = images.map((img, i) => ({
    kind: "showcase" as const,
    title: img.alt || `Look ${i + 1}`,
    description: "From our curated catalogue — explore the full shop for live pricing and sizes.",
    imageSrc: img.src,
    badge: "Highlight",
    priceLabel: "Shop",
    ratingLabel: "★★★★★",
    href: "/#shop",
  }));

  return (
    <BestSellerCardCarousel
      slides={slides}
      title="Card carousel"
      subtitle="Seamless image carousel with coverflow."
      eyebrow="Gallery"
      autoplayDelay={autoplayDelay}
      showPagination={showPagination}
      showNavigation={showNavigation}
    />
  );
}
