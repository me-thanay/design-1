"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SCROLL_REVEAL_EASE, defaultRevealViewport } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

export type ImageGalleryItem = {
  id: string;
  src: string;
  alt: string;
  content?: React.ReactNode;
};

type ImageGalleryProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  items: ImageGalleryItem[];
  className?: string;
  heightClassName?: string;
};

export function ImageGallery({
  title,
  subtitle,
  items,
  className,
  heightClassName = "h-[380px] sm:h-[420px]",
}: ImageGalleryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("w-full", className)}>
      {(title || subtitle) && (
        <motion.div
          className="mb-6 max-w-3xl px-1"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, ...defaultRevealViewport }}
          transition={{
            duration: reduceMotion ? 0 : 0.55,
            ease: SCROLL_REVEAL_EASE,
          }}
        >
          {title ? (
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-2 text-sm text-neutral-600 sm:text-base">{subtitle}</p>
          ) : null}
        </motion.div>
      )}

      {/* Scroll horizontally so expanded hover never overlaps siblings or page content */}
      <div
        className={cn(
          "no-scrollbar -mx-4 flex w-auto max-w-none gap-3 overflow-x-auto overflow-y-hidden px-4 pb-2 pt-1 scroll-smooth sm:-mx-0 sm:mx-0 sm:max-w-full sm:px-0",
          "snap-x snap-mandatory sm:snap-none",
          heightClassName,
        )}
      >
        {items.map((it, index) => (
          <motion.div
            key={it.id}
            className={cn(
              "group relative shrink-0 snap-start overflow-hidden rounded-3xl",
              "w-[min(82vw,240px)] sm:w-[220px] md:w-[248px]",
              "ring-1 ring-black/10 bg-white/40 shadow-sm",
              "transition-shadow duration-300 ease-out hover:z-10 hover:shadow-xl hover:ring-black/20",
            )}
            initial={
              reduceMotion ? false : { opacity: 0, scale: 0.96, y: 24, filter: "blur(6px)" }
            }
            whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: false, ...defaultRevealViewport }}
            transition={{
              duration: reduceMotion ? 0 : 0.62,
              delay: reduceMotion ? 0 : index * 0.075,
              ease: SCROLL_REVEAL_EASE,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              src={it.src}
              alt={it.alt}
              loading="lazy"
              decoding="async"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

            {it.content ? (
              <div className="absolute inset-x-0 bottom-0 max-h-[55%] overflow-y-auto p-3 sm:p-4">
                <div className="pointer-events-auto">{it.content}</div>
              </div>
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
