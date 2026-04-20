"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TestimonialColumnItem = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export type TestimonialsColumnProps = {
  className?: string;
  testimonials: TestimonialColumnItem[];
  /** Seconds for one full loop (half the stacked height). */
  duration?: number;
};

/**
 * Vertical marquee column: two stacked copies of the same cards so
 * translateY -50% loops seamlessly.
 */
export function TestimonialsColumn({
  className,
  testimonials,
  duration = 10,
}: TestimonialsColumnProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("relative h-full min-h-0 w-full max-w-xs flex-1 overflow-hidden", className)}>
      <motion.div
        className="flex flex-col gap-6 pb-6"
        animate={reduceMotion ? { y: "0%" } : { y: "-50%" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }
        }
      >
        {[0, 1].map((loop) => (
          <React.Fragment key={loop}>
            {testimonials.map((item, i) => (
              <article
                key={`${loop}-${item.name}-${i}`}
                className="w-full max-w-xs rounded-3xl border border-black/10 bg-white/95 p-8 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-sm"
              >
                <p className="text-sm leading-relaxed text-neutral-700">{item.text}</p>
                <div className="mt-5 flex items-center gap-3">
                  <Image
                    width={40}
                    height={40}
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-black/5"
                    sizes="40px"
                  />
                  <div className="flex min-w-0 flex-col">
                    <div className="text-sm font-medium leading-5 tracking-tight text-neutral-900">
                      {item.name}
                    </div>
                    <div className="text-xs leading-5 tracking-tight text-neutral-500">{item.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
