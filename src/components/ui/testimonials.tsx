"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { ProductCartControl } from "@/components/cart/product-cart-control";
import type { Product } from "@/lib/products";

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  imageSrc: string;
  /** e.g. “Best seller” on product cards */
  badge?: string;
  /** When set, card shows price row, highlights, and add-to-cart (best-seller products). */
  product?: Product;
}

export interface TestimonialSectionProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.58, 1] as const,
    },
  },
};

/**
 * Responsive grid of cards (testimonials or repurposed for best-seller products).
 */
export function TestimonialSection({ title, subtitle, testimonials }: TestimonialSectionProps) {
  return (
    <section className="w-full bg-background py-12 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>

        <motion.div
          className="mt-10 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="relative aspect-[3/4] min-h-[280px] overflow-hidden rounded-xl bg-card shadow-md sm:min-h-[320px] sm:rounded-2xl"
              variants={itemVariants}
            >
              {testimonial.badge ? (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-[#c9a227] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-md sm:left-4 sm:top-4 sm:text-[11px]">
                  {testimonial.badge}
                </span>
              ) : null}
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonial.imageSrc}
                  alt={testimonial.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-left text-white sm:p-6">
                <Quote className="mb-3 h-7 w-7 text-white/45 sm:h-8 sm:w-8" aria-hidden />
                <blockquote className="text-sm font-medium leading-relaxed sm:text-base">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
                  {testimonial.product ? (
                    <>
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex max-w-full rounded-lg bg-[#c9a227]/35 px-2.5 py-1 text-sm font-bold tracking-tight text-white shadow-sm ring-1 ring-[#c9a227]/60 sm:text-base">
                          {testimonial.name}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm sm:text-base">
                        <span className="inline-flex rounded-md bg-white px-2.5 py-1 text-base font-bold tabular-nums text-neutral-900 shadow-md sm:text-lg">
                          ₹{Math.round(testimonial.product.price).toLocaleString("en-IN")}
                        </span>
                        <span className="font-medium text-white/90">
                          {testimonial.product.rating.toFixed(1)}★
                        </span>
                        {testimonial.product.subcategory ? (
                          <span className="text-white/70">· {testimonial.product.subcategory}</span>
                        ) : null}
                      </div>
                      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                        <ProductCartControl
                          product={testimonial.product}
                          image={testimonial.imageSrc}
                          tone="onImage"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="font-semibold text-white">
                      — {testimonial.name}
                      <span className="ml-1 font-normal text-white/70">{testimonial.role}</span>
                    </p>
                  )}
                </figcaption>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
