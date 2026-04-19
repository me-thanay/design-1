"use client";

import * as React from "react";
import {
  BestSellerCardCarousel,
  type BestSellerCarouselSlide,
} from "@/components/ui/card-carousel";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { normalizeProductRow, type Product } from "@/lib/products";

const LOCAL_CLOTHES_KEY = "freelance-1.local.clothes.v1";

const FALLBACK_SLIDES: BestSellerCarouselSlide[] = [
  {
    kind: "showcase",
    title: "Occasion-ready drape",
    description:
      "Rich tones and fluid fall — pair with statement jewellery for weddings and receptions.",
    imageSrc:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
    badge: "Editor's pick",
    priceLabel: "From ₹1,499",
    ratingLabel: "4.9★",
    href: "/categories/sarees",
  },
  {
    kind: "showcase",
    title: "Tailored blouse edit",
    description: "Clean necklines and premium linings — made to sit perfectly under silk and cotton.",
    imageSrc:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    badge: "Trending",
    priceLabel: "From ₹849",
    ratingLabel: "4.8★",
    href: "/categories/blouses",
  },
  {
    kind: "showcase",
    title: "Everyday kurti comfort",
    description: "Breathable fabrics for long days — subtle prints that dress up or down in one step.",
    imageSrc:
      "https://images.unsplash.com/photo-1583394838336-acd977736f71?auto=format&fit=crop&w=900&q=80",
    badge: "Daily wear",
    priceLabel: "From ₹699",
    ratingLabel: "4.7★",
    href: "/categories/kurtis",
  },
];

function sortByRating(a: Product, b: Product) {
  const rd = b.rating - a.rating;
  if (Math.abs(rd) > 0.001) return rd;
  return b.price - a.price;
}

function fallbackImageForProduct(p: Product) {
  switch (p.category) {
    case "blouses":
      return "/stock_images/PARTY%20WEAR%20BLOUSE.jpeg";
    case "kurtis":
      return "/stock_images/COTTON%20KURTI.jpeg";
    case "gowns":
      return "/stock_images/PARTY%20WEAR%20GOWN.jpeg";
    case "sarees":
    default:
      return "/stock_images/banarasi%20silk.jpeg";
  }
}

export function HomeBestSellersSection() {
  const [slides, setSlides] = React.useState<BestSellerCarouselSlide[]>(FALLBACK_SLIDES);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        let rows: any[] = [];
        if (!supabaseEnabled) {
          const raw = window.localStorage.getItem(LOCAL_CLOTHES_KEY);
          const parsed = raw ? (JSON.parse(raw) as any[]) : [];
          rows = Array.isArray(parsed) ? parsed : [];
        } else {
          const { data, error } = await supabase
            .from("clothes")
            .select("*")
            .eq("in_stock", true)
            .order("created_at", { ascending: false });
          if (error || !data) {
            setSlides(FALLBACK_SLIDES);
            setReady(true);
            return;
          }
          rows = data as any[];
        }

        const products = rows
          .map((r) => normalizeProductRow(r))
          .filter((p) => p.inStock && p.rating >= 3.5)
          .sort(sortByRating)
          .slice(0, 10);

        if (!products.length) {
          setSlides(FALLBACK_SLIDES);
          setReady(true);
          return;
        }

        const mapped: BestSellerCarouselSlide[] = products.map((p, i) => ({
          kind: "product" as const,
          product: p,
          imageSrc: p.image || fallbackImageForProduct(p),
          badge: i === 0 ? "Top rated" : "Best seller",
        }));

        setSlides(mapped);
      } finally {
        setReady(true);
      }
    };

    void load();
  }, []);

  if (!ready) {
    return (
      <section
        id="best-seller"
        className="surface-texture scroll-mt-24 border-b border-black/5 py-12"
        aria-busy="true"
      >
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-neutral-500">
          Loading best sellers…
        </div>
      </section>
    );
  }

  return (
    <section
      id="best-seller"
      className="surface-texture scroll-mt-24 overflow-x-hidden border-b border-black/5 py-10 sm:py-14"
    >
      <BestSellerCardCarousel
        slides={slides}
        subtitle="Highest-rated in-stock pieces from your catalogue — swipe for details, then add to cart."
      />
    </section>
  );
}
