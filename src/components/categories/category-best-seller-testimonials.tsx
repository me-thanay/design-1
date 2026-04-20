"use client";

import * as React from "react";
import ImageGallery from "@/components/ui/image-gallery";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import type { ClothingCategory, Product } from "@/lib/products";
import { normalizeProductRow } from "@/lib/products";

const LOCAL_CLOTHES_KEY = "freelance-1.local.clothes.v1";

function fallbackImageFor(category: ClothingCategory) {
  switch (category) {
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

function sortByRating(a: Product, b: Product) {
  const rd = b.rating - a.rating;
  if (Math.abs(rd) > 0.001) return rd;
  return b.price - a.price;
}

function normalizeSrc(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (!src.startsWith("/")) return src;
  return encodeURI(src);
}

function productToGalleryItem(p: Product, category: ClothingCategory, rank: number) {
  const img = p.image || fallbackImageFor(category);
  return {
    src: normalizeSrc(img),
    title: p.name,
    subtitle: p.subcategory ? `${p.subcategory} · best rated` : "Best rated · in stock",
    badge: rank === 1 ? "Top rated" : "Best seller",
    priceLabel: `₹${Math.round(p.price).toLocaleString("en-IN")}`,
    ratingLabel: `${p.rating.toFixed(1)}★`,
  };
}

type Props = {
  category: ClothingCategory;
  categoryTitle: string;
  limit?: number;
};

/**
 * Loads highest-rated in-stock products for the category and renders them as
 * testimonial-style cards (image + quote + name + price/rating line).
 */
export function CategoryBestSellerTestimonials({ category, categoryTitle, limit = 6 }: Props) {
  const [items, setItems] = React.useState<ReturnType<typeof productToGalleryItem>[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
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
          if (error) {
            setItems([]);
            return;
          }
          rows = (data as any[]) ?? [];
        }

        const products = rows
          .map((r) => normalizeProductRow(r))
          .filter((p) => p.inStock && p.category === category)
          .sort(sortByRating)
          .slice(0, limit);

        setItems(products.map((p, i) => productToGalleryItem(p, category, i + 1)));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [category, limit]);

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-black/10 bg-white/60 py-16 text-center text-muted-foreground">
        Loading best sellers…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-dashed border-black/15 bg-white/50 py-14 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Best sellers · {categoryTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          No products with ratings in this category yet. Add in-stock items and set ratings in the Creator
          dashboard to showcase them here.
        </p>
      </section>
    );
  }

  return (
    <div className="w-full">
      <ImageGallery
        title={`Best sellers · ${categoryTitle}`}
        subtitle="Top-rated pieces in this category — price and rating included."
        items={items}
        className="py-0"
      />
    </div>
  );
}
