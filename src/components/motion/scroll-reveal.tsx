"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Shared easing — smooth deceleration for scroll reveals */
export const SCROLL_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

/** Default how early sections start animating (tuned for sticky header + comfortable reads) */
export const defaultRevealViewport = {
  margin: "-14% 0px -10% 0px" as const,
  amount: 0.11 as const,
};

export type ScrollRevealVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "scale"
  | "blur";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Extra delay in seconds (stagger blocks). */
  delay?: number;
  /** Offset in px (vertical for fade-up/down, horizontal for fade-left/right). */
  y?: number;
  variant?: ScrollRevealVariant;
  /** If false, animations replay each time the element scrolls into view again. */
  once?: boolean;
  /** Override default viewport margin (CSS margin string for IntersectionObserver). */
  viewportMargin?: string;
  /** Fraction of element that must be visible (0–1). */
  viewportAmount?: number;
  /** Motion duration in seconds (reduced motion → 0). */
  duration?: number;
};

const inView = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  filter: "blur(0px)",
};

export function initialFor(
  variant: ScrollRevealVariant,
  offset: number,
  reduce: boolean,
): Record<string, string | number> {
  if (reduce) return { ...inView };
  switch (variant) {
    case "fade-down":
      return { opacity: 0, x: 0, y: -offset, scale: 1, filter: "blur(0px)" };
    case "fade-left":
      return { opacity: 0, x: -offset, y: 0, scale: 1, filter: "blur(0px)" };
    case "fade-right":
      return { opacity: 0, x: offset, y: 0, scale: 1, filter: "blur(0px)" };
    case "scale":
      return { opacity: 0, x: 0, y: 0, scale: 0.93, filter: "blur(0px)" };
    case "blur":
      return { opacity: 0, x: 0, y: offset * 0.35, scale: 1, filter: "blur(12px)" };
    case "fade-up":
    default:
      return { opacity: 0, x: 0, y: offset, scale: 1, filter: "blur(0px)" };
  }
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  variant = "fade-up",
  once = false,
  viewportMargin = defaultRevealViewport.margin,
  viewportAmount = defaultRevealViewport.amount,
  duration = 0.64,
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const d = reduceMotion ? 0 : duration;

  return (
    <motion.div
      className={cn(className)}
      initial={initialFor(variant, y, !!reduceMotion)}
      whileInView={inView}
      viewport={{ once, margin: viewportMargin, amount: viewportAmount }}
      transition={{
        duration: d,
        delay: reduceMotion ? 0 : delay,
        ease: SCROLL_REVEAL_EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

type ScrollRevealGroupProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each child reveal */
  stagger?: number;
  /** Delay before the first child starts */
  delayChildren?: number;
  variant?: ScrollRevealVariant;
  y?: number;
  once?: boolean;
  viewportMargin?: string;
  viewportAmount?: number;
  childDuration?: number;
};

/**
 * Staggers scroll-in animations for each direct child (use for section stacks).
 */
export function ScrollRevealGroup({
  children,
  className,
  stagger = 0.09,
  delayChildren = 0.04,
  variant = "fade-up",
  y = 26,
  once = false,
  viewportMargin = defaultRevealViewport.margin,
  viewportAmount = defaultRevealViewport.amount,
  childDuration = 0.62,
}: ScrollRevealGroupProps) {
  const reduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: initialFor(variant, y, !!reduceMotion),
    visible: {
      ...inView,
      transition: {
        duration: reduceMotion ? 0 : childDuration,
        ease: SCROLL_REVEAL_EASE,
      },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : stagger,
        delayChildren: reduceMotion ? 0 : delayChildren,
      },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin, amount: viewportAmount }}
    >
      {React.Children.map(children, (child, i) => {
        if (child === null || child === undefined) return null;
        return (
          <motion.div key={i} variants={itemVariants} className="min-w-0">
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
