"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_EASE = [0.16, 1, 0.3, 1] as const;

export type Feature1Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  /** Optional second line shown under title with stronger weight */
  titleEmphasis?: string;
  /** One or more body paragraphs */
  paragraphs: string[];
  imageSrc: string;
  imageAlt: string;
  buttonPrimary: { label: string; href: string };
  buttonSecondary: { label: string; href: string };
  className?: string;
};

export function Feature1({
  id = "about",
  eyebrow,
  title,
  titleEmphasis,
  paragraphs,
  imageSrc,
  imageAlt,
  buttonPrimary,
  buttonSecondary,
  className,
}: Feature1Props) {
  const reduce = useReducedMotion();

  return (
    <section
      id={id}
      className={cn("surface-texture scroll-mt-24 border-y border-black/5 py-16 sm:py-20 lg:py-24", className)}
      aria-labelledby={`${id}-heading`}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {eyebrow ? (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, ease: SCROLL_EASE }}
                className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500"
              >
                {eyebrow}
              </motion.p>
            ) : null}

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.55, delay: 0.05, ease: SCROLL_EASE }}
            >
              <h2
                id={`${id}-heading`}
                className="mt-3 max-w-xl text-balance font-serif text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:mt-4 lg:text-5xl"
              >
                {title}
                {titleEmphasis ? (
                  <>
                    <br />
                    <span className="text-neutral-700">{titleEmphasis}</span>
                  </>
                ) : null}
              </h2>
            </motion.div>

            <div className="mt-6 max-w-xl space-y-4">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8% 0px" }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.07, ease: SCROLL_EASE }}
                  className="text-pretty font-serif text-sm leading-relaxed text-neutral-600 sm:text-base"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.5, delay: 0.2, ease: SCROLL_EASE }}
              className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
                <Link
                  href={buttonPrimary.href}
                  className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6")}
                >
                  {buttonPrimary.label}
                </Link>
              </motion.div>
              <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
                <Link
                  href={buttonSecondary.href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "inline-flex rounded-full border-black/15 bg-white/80 px-6 hover:bg-white",
                  )}
                >
                  {buttonSecondary.label}
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.97, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.65, delay: 0.1, ease: SCROLL_EASE }}
            whileHover={reduce ? undefined : { scale: 1.02 }}
            className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10 lg:mx-0 lg:max-w-none"
          >
            <div className="relative aspect-[3/4] w-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover object-top"
                sizes="(min-width: 1024px) 42rem, 100vw"
                priority={false}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
