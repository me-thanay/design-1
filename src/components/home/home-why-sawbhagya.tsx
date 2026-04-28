"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Sparkles, Truck, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="group rounded-3xl border border-black/10 bg-white/75 p-5 shadow-sm ring-1 ring-black/[0.03] backdrop-blur transition-shadow hover:shadow-md"
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-900 text-white shadow-sm ring-1 ring-black/10">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-neutral-600">
            {desc}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HomeWhySawbhagya({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <section
      className={cn(
        "surface-texture border-b border-black/5 py-14 sm:py-16",
        className,
      )}
      aria-labelledby="why-sawbhagya"
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500"
            >
              Why Sawbhagya
            </motion.p>

            <motion.h2
              id="why-sawbhagya"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, ease: EASE }}
              className="mt-3 text-balance font-serif text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
            >
              Premium feel, clear choices, and a smooth buying experience.
            </motion.h2>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: EASE, delay: reduce ? 0 : 0.05 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base"
            >
              We focus on quality fabrics, reliable fits, and a checkout flow that’s
              fast and simple. No confusion, no clutter—just curated pieces you can
              trust.
            </motion.p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureCard
              icon={<BadgeCheck className="h-5 w-5" aria-hidden />}
              title="Curated quality"
              desc="Premium fabric feel and finishing—picked for real daily wear."
            />
            <FeatureCard
              icon={<Truck className="h-5 w-5" aria-hidden />}
              title="Fast coordination"
              desc="Order updates on phone/WhatsApp so you’re never guessing."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
              title="Reliable experience"
              desc="Clear policies and consistent product information across the site."
            />
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" aria-hidden />}
              title="Made to feel special"
              desc="A premium theme, smooth motion, and details that feel crafted."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

