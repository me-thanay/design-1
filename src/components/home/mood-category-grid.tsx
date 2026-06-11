"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MoodCategoryItem = {
  title: string;
  sub: string;
  href: string;
  img: string;
};

export function MoodCategoryGrid({ items }: { items: MoodCategoryItem[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 md:grid-cols-4"
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
          className="group overflow-hidden rounded-2xl border border-black/10 bg-white/50 shadow-sm ring-1 ring-black/[0.03] transition-shadow duration-300 hover:bg-white hover:shadow-lg hover:ring-black/15"
        >
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.img}
              alt=""
              className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-32 lg:h-28"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-85" />
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
