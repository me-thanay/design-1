"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoodCategoryItem = {
  title: string;
  sub: string;
  href: string;
  img: string;
  imageFit?: "cover" | "contain";
};

export function MoodCategoryGrid({ items }: { items: MoodCategoryItem[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-48px", amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {items.map((c, i) => (
        <motion.a
          key={c.title}
          href={c.href}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{
            duration: reduceMotion ? 0 : 0.45,
            delay: reduceMotion ? 0 : 0.04 * i,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={
            reduceMotion
              ? undefined
              : { y: -6, scale: 1.02, transition: { type: "spring", stiffness: 420, damping: 22 } }
          }
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className={`group overflow-hidden rounded-2xl border border-black/10 bg-white/50 shadow-sm ring-1 ring-black/[0.03] transition-shadow duration-300 hover:bg-white hover:shadow-lg hover:ring-black/15 ${
            i === 4
              ? "col-span-2 mx-auto w-[calc(50%-0.5rem)] sm:col-span-1 sm:mx-0 sm:w-auto"
              : ""
          }`}
        >
          <div className="relative bg-neutral-50">
            <img
              src={c.img}
              alt=""
              className="h-48 w-full object-cover object-top sm:h-56 lg:h-52 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{c.title}</p>
                  <p className="mt-0.5 text-xs text-white/80">{c.sub}</p>
                </div>
                <span className="text-white/80 transition duration-300 group-hover:translate-x-0.5 group-hover:text-white">
                  →
                </span>
              </div>
            </div>
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}
