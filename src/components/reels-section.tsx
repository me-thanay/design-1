"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { HeroSection } from "@/components/ui/feature-carousel";
import { SCROLL_REVEAL_EASE } from "@/components/motion/scroll-reveal";
import { ProductCartControl } from "@/components/cart/product-cart-control";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { normalizeProductRow, type Product } from "@/lib/products";

export default function ReelsSection({
  sectionId = "reels",
  eyebrow = "Media Spotlight",
  title,
  subtitle,
}: {
  sectionId?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const stockImages = React.useMemo(
    () => [
      {
        src: "/stock_images/banarasi%20silk.jpeg",
        alt: "Festive saree set",
      },
      {
        src: "/stock_images/PARTY%20WEAR%20BLOUSE.jpeg",
        alt: "Statement blouse",
      },
      {
        src: "/stock_images/linen%20saree.jpeg",
        alt: "Ready-to-wear saree",
      },
      {
        src: "/stock_images/COTTON%20KURTI.jpeg",
        alt: "Cotton essentials",
      },
      {
        src: "/stock_images/Organza.jpeg",
        alt: "Festive edit",
      },
    ],
    [],
  );

  const [bestSellerProducts, setBestSellerProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const load = async () => {
      if (!supabaseEnabled) return;
      try {
        const { data, error } = await supabase
          .from("clothes")
          .select("*")
          .eq("in_stock", true)
          .order("created_at", { ascending: false });
        if (error || !data) return;

        const normalized = (data as any[])
          .map((r) => normalizeProductRow(r))
          .filter((p) => p.inStock)
          // “high rated” threshold
          .filter((p) => p.rating >= 4.7)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);

        setBestSellerProducts(normalized);
      } catch {
        // ignore; keep stock images
      }
    };

    load();
  }, []);

  const slides = React.useMemo(() => {
    // Keep stock images as-is; replace only when we have high-rated admin products.
    const base = stockImages.map((s) => ({
      ...s,
      product: null as Product | null,
      meta: undefined as
        | {
            badge?: string;
            price?: string;
            ratingText?: string;
          }
        | undefined,
    }));
    const replacements = bestSellerProducts.slice(0, base.length);
    replacements.forEach((p, i) => {
      base[i] = {
        src: p.image || base[i].src,
        alt: p.name,
        product: p,
        meta: {
          badge: "Best seller",
          price: `₹${Math.round(p.price).toLocaleString("en-IN")}`,
          ratingText: `${p.rating.toFixed(1)} ★`,
        },
      };
    });
    return base;
  }, [bestSellerProducts, stockImages]);

  const activeSlide = slides.length ? slides[activeIndex % slides.length] : null;
  const activeProduct = activeSlide?.product ?? null;
  const activeProductImage =
    activeProduct && activeSlide
      ? activeProduct.image || activeSlide.src
      : "";

  const defaultTitle = (
    <>
      Best <span className="text-[#f5c97a]">sellers</span>
    </>
  );

  return (
    <section id={sectionId} className="surface-texture pb-14 pt-2">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="overflow-hidden rounded-[2.25rem] bg-transparent ring-1 ring-black/10">
          <HeroSection
            eyebrow={eyebrow}
            title={title ?? defaultTitle}
            subtitle={
              subtitle ??
              "Tap through highlights of best sellers, then head to the collection you love."
            }
            images={slides.map(({ src, alt, meta }) => ({ src, alt, meta }))}
            tone="light"
            className="bg-transparent"
            onSlideChange={setActiveIndex}
            aside={
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct?.id ?? `slide-${activeIndex}`}
                  className="rounded-3xl border border-black/10 bg-white/85 p-5 text-left shadow-md ring-1 ring-black/[0.06] backdrop-blur-md"
                  initial={reduceMotion ? false : { opacity: 0, x: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -12, filter: "blur(4px)" }}
                  transition={{ duration: reduceMotion ? 0 : 0.38, ease: SCROLL_REVEAL_EASE }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                    Details
                  </p>
                  {activeProduct ? (
                    <>
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-neutral-900">
                            {activeProduct.name}
                          </p>
                          <p className="mt-1 text-xs text-neutral-600">
                            Rated {activeProduct.rating.toFixed(1)} ★
                            {activeProduct.subcategory
                              ? ` · ${activeProduct.subcategory}`
                              : ""}
                          </p>
                        </div>
                        <div className="text-base font-semibold text-neutral-900">
                          ₹{Math.round(activeProduct.price).toLocaleString("en-IN")}
                        </div>
                      </div>

                      {activeProduct.description ? (
                        <p className="mt-3 text-sm text-neutral-700 line-clamp-4">
                          {activeProduct.description}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-neutral-600">
                          Premium fabric and finishing — curated for this edit.
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-2">
                        <motion.div
                          whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
                          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                          <ProductCartControl
                            product={activeProduct}
                            image={activeProductImage}
                            tone="heroDark"
                          />
                        </motion.div>
                        <motion.a
                          href="/#shop"
                          className="w-full rounded-full border border-black/10 bg-white/80 px-5 py-2.5 text-center text-sm font-semibold text-neutral-900 shadow-sm transition-colors hover:bg-white"
                          whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
                          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                          View in shop
                        </motion.a>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 text-sm font-semibold text-neutral-900">
                        Curated best-seller picks
                      </p>
                      <p className="mt-2 text-sm text-neutral-600">
                        These are stock highlights. When you add high-rated products
                        from Admin, this panel will show the real product details.
                      </p>
                      <motion.a
                        href="/#shop"
                        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-neutral-800"
                        whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      >
                        Shop now
                      </motion.a>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            }
          />

          {(() => {
            const active = slides[slides.length ? activeIndex % slides.length : 0];
            const p = active?.product ?? null;
            if (!p) return null;
            const stripImage = p.image || active.src;
            return (
              <div className="px-4 pb-6 sm:px-6">
                <div className="mx-auto flex w-full max-w-[740px] flex-col items-center gap-3 rounded-3xl border border-black/10 bg-white/60 p-4 text-center shadow-sm ring-1 ring-black/[0.03] backdrop-blur sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      Rated {p.rating.toFixed(1)} ★ · ₹
                      {Math.round(p.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="w-full min-w-[200px] shrink-0 sm:w-auto sm:max-w-[280px]">
                    <ProductCartControl product={p} image={stripImage} tone="card" compact />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* subtle bottom fade for separation */}
          <div className="pointer-events-none h-10 bg-gradient-to-b from-transparent to-black/5" />
        </div>
      </div>
    </section>
  );
}

