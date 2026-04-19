"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_EASE = [0.16, 1, 0.3, 1] as const;

const paragraphContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.032, delayChildren: 0.04 },
  },
};

const wordChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: SCROLL_EASE },
  },
};

const wordChildReduced: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: SCROLL_EASE },
  },
};

function TypewriterLine({
  text,
  msPerChar,
  active,
  onComplete,
}: {
  text: string;
  msPerChar: number;
  active: boolean;
  onComplete?: () => void;
}) {
  const [out, setOut] = React.useState(active ? text : "");
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  React.useEffect(() => {
    if (!active) {
      setOut("");
      return;
    }
    setOut("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        onCompleteRef.current?.();
      }
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [text, msPerChar, active]);

  return <>{out}</>;
}

function AnimatedParagraph({
  text,
  reduce,
  className,
}: {
  text: string;
  reduce: boolean;
  className?: string;
}) {
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const child = reduce ? wordChildReduced : wordChild;

  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-6% 0px", amount: 0.35 }}
      variants={paragraphContainer}
    >
      {words.map((word, wi) => (
        <React.Fragment key={`${word}-${wi}`}>
          {wi > 0 ? "\u00a0" : null}
          <motion.span variants={child} className="inline">
            {word}
          </motion.span>
        </React.Fragment>
      ))}
    </motion.p>
  );
}

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
  const copyRef = React.useRef<HTMLDivElement>(null);
  const copyInView = useInView(copyRef, { once: true, amount: 0.22 });
  const [emphasisVisible, setEmphasisVisible] = React.useState(Boolean(reduce));

  const onTitleTyped = React.useCallback(() => {
    setEmphasisVisible(true);
  }, []);

  React.useEffect(() => {
    if (reduce && titleEmphasis) setEmphasisVisible(true);
  }, [reduce, titleEmphasis]);

  const showTypewriter = Boolean(copyInView && !reduce);

  return (
    <section
      id={id}
      className={cn("surface-texture scroll-mt-24 border-y border-black/5 py-16 sm:py-20 lg:py-24", className)}
      aria-labelledby={`${id}-heading`}
    >
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div
            ref={copyRef}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {eyebrow ? (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.55, ease: SCROLL_EASE }}
                className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500"
              >
                {eyebrow}
              </motion.p>
            ) : null}

            <h2
              id={`${id}-heading`}
              className="mt-3 max-w-xl text-balance font-serif text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl lg:mt-4 lg:text-5xl"
            >
              {reduce ? (
                title
              ) : (
                <TypewriterLine
                  text={title}
                  msPerChar={22}
                  active={showTypewriter}
                  onComplete={titleEmphasis ? onTitleTyped : undefined}
                />
              )}
              {titleEmphasis ? (
                <motion.span
                  className="mt-1 block text-neutral-700"
                  initial={false}
                  animate={
                    reduce || emphasisVisible
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 14 }
                  }
                  transition={{ duration: 0.55, ease: SCROLL_EASE }}
                >
                  {reduce ? (
                    <>
                      <br />
                      {titleEmphasis}
                    </>
                  ) : emphasisVisible ? (
                    <>
                      <br />
                      <TypewriterLine text={titleEmphasis} msPerChar={16} active={true} />
                    </>
                  ) : null}
                </motion.span>
              ) : null}
            </h2>

            <div className="mt-6 max-w-xl space-y-5">
              {paragraphs.map((p, i) => (
                <AnimatedParagraph
                  key={i}
                  text={p}
                  reduce={Boolean(reduce)}
                  className="text-pretty font-serif text-sm leading-relaxed text-neutral-600 sm:text-base"
                />
              ))}
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-6% 0px" }}
              transition={{ duration: 0.5, delay: 0.12, ease: SCROLL_EASE }}
              className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <motion.div whileHover={reduce ? undefined : { y: -3 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
                <Link
                  href={buttonPrimary.href}
                  className={cn(buttonVariants({ variant: "default" }), "rounded-full px-6")}
                >
                  {buttonPrimary.label}
                </Link>
              </motion.div>
              <motion.div whileHover={reduce ? undefined : { y: -3 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
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
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 28, rotate: -0.4 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.72, delay: 0.08, ease: SCROLL_EASE }}
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
