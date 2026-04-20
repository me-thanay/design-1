"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: i * 0.08,
      ease: SCROLL_EASE,
    },
  }),
};

const fadeUpReduced: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: SCROLL_EASE },
  },
};

export type Feature1Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  titleEmphasis?: string;
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
  const block = reduce ? fadeUpReduced : fadeUp;

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
                custom={0}
                variants={block}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10% 0px", amount: 0.25 }}
                className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500"
              >
                {eyebrow}
              </motion.p>
            ) : null}

            <motion.div
              custom={eyebrow ? 1 : 0}
              variants={block}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10% 0px", amount: 0.25 }}
              className="mt-3 max-w-xl lg:mt-4"
            >
              <h2
                id={`${id}-heading`}
                className="text-balance font-serif text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl"
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

            <div className="mt-6 max-w-xl space-y-5">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  custom={i + 2}
                  variants={block}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-8% 0px", amount: 0.2 }}
                  className="text-pretty font-serif text-sm leading-relaxed text-neutral-600 sm:text-base"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            <motion.div
              custom={paragraphs.length + 2}
              variants={block}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-6% 0px", amount: 0.2 }}
              className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <motion.div
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <Link
                  href={buttonPrimary.href}
                  className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6")}
                >
                  {buttonPrimary.label}
                </Link>
              </motion.div>
              <motion.div
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
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
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.75, ease: SCROLL_EASE }}
            whileHover={reduce ? undefined : { scale: 1.015 }}
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
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
