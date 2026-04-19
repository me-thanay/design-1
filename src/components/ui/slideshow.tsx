"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SCROLL_REVEAL_EASE } from "@/components/motion/scroll-reveal";

type Slide = {
  img: string;
  text: [string, string];
};

const defaultSlides: Slide[] = [
  {
    img: "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=2000&q=80",
    text: ["FESTIVE", "SILK EDITS"],
  },
  {
    img: "https://images.unsplash.com/photo-1771507056578-f9675a2a8f8a?auto=format&fit=crop&w=2000&q=80",
    text: ["JEWELRY", "AND DRAPES"],
  },
  {
    img: "https://images.unsplash.com/photo-1742677143629-b9784beab2e1?auto=format&fit=crop&w=2000&q=80",
    text: ["ELEGANCE", "IN WHITE"],
  },
  {
    img: "https://images.unsplash.com/photo-1767125715251-c257c8f8cefe?auto=format&fit=crop&w=2000&q=80",
    text: ["CRAFT", "IN DETAIL"],
  },
  {
    img: "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?auto=format&fit=crop&w=2000&q=80",
    text: ["COLOR", "THAT GLOWS"],
  },
];

export default function Slideshow({
  slides = defaultSlides,
  className,
}: {
  slides?: Slide[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [current, setCurrent] = React.useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className={className}>
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-black">
        <div className="relative h-[520px] sm:h-[560px] md:h-[620px]">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={current}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, ease: SCROLL_REVEAL_EASE }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slides[current].img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/55" />
              <div className="absolute inset-0 [background:radial-gradient(70%_60%_at_50%_30%,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.65)_75%,rgba(0,0,0,0.85)_100%)]" />

              <div className="relative z-10 flex h-full items-end p-6 sm:p-8">
                <motion.div
                  className="max-w-xl"
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.45,
                    delay: reduceMotion ? 0 : 0.12,
                    ease: SCROLL_REVEAL_EASE,
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                    Media spotlight
                  </p>
                  <h3 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    {slides[current].text[0]}
                    <br />
                    {slides[current].text[1]}
                  </h3>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            aria-label="Previous slide"
            whileHover={reduceMotion ? undefined : { scale: 1.08, x: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          >
            ←
          </motion.button>
          <motion.button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            aria-label="Next slide"
            whileHover={reduceMotion ? undefined : { scale: 1.08, x: 2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          >
            →
          </motion.button>

          <motion.div
            className="absolute bottom-4 right-4 z-20 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md"
            key={current}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

