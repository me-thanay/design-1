"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import {
  TestimonialsColumn,
  type TestimonialColumnItem,
} from "@/components/ui/testimonials-columns-1";

const TESTIMONIALS: TestimonialColumnItem[] = [
  {
    text: "The Banarasi drape I ordered is even richer in person—fabric weight and zari work feel truly premium. Delivery was quick and the blouse piece matched perfectly.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Ananya Sharma",
    role: "Bengaluru",
  },
  {
    text: "Finally a brand where party-wear kurtis actually fit well on tall frames. The georgette layer stayed crisp through an entire evening.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Priya Nair",
    role: "Hyderabad",
  },
  {
    text: "Linen saree for summer office days—breathable, minimal starch smell, and the fall photographs exactly like the site. Will reorder in another colour.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Meera Iyer",
    role: "Chennai",
  },
  {
    text: "Silk blouse tailoring notes were followed to the letter—sleeve length and back depth are spot on. Feels bespoke without the boutique wait time.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Kavya Reddy",
    role: "Mumbai",
  },
  {
    text: "Organza saree for my sister’s engagement—light, structured pleats, and the border didn’t fray after steaming. Compliments all night.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Divya Patel",
    role: "Ahmedabad",
  },
  {
    text: "Casual gown for brunch—soft cotton blend, pockets sit flat, and length was true to the size chart. Rare find at this price point.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Sneha Kulkarni",
    role: "Pune",
  },
  {
    text: "Rayon kurti set washed well—no colour bleed. Colours on screen matched what arrived; prepaid discount was a nice touch.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Ritu Verma",
    role: "Delhi NCR",
  },
  {
    text: "Modal silk drapes like a dream for office pujas—subtle sheen, not loud. Packaging felt gift-ready for my mother-in-law.",
    image:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Neha Joshi",
    role: "Jaipur",
  },
  {
    text: "Party-wear blouse with beadwork—threads secure, lining breathable. Team helped swap size before dispatch; very responsive on WhatsApp.",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&h=200&q=80",
    name: "Aditi Rao",
    role: "Goa",
  },
];

const firstColumn = TESTIMONIALS.slice(0, 3);
const secondColumn = TESTIMONIALS.slice(3, 6);
const thirdColumn = TESTIMONIALS.slice(6, 9);

export function HomeTestimonialsMarquee() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="testimonials"
      className="surface-texture relative scroll-mt-24 border-t border-black/5 py-16 sm:py-20"
      aria-labelledby="testimonials-heading"
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-8% 0px" }}
          className="mx-auto flex max-w-[540px] flex-col items-center text-center"
        >
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600 shadow-sm">
              <Quote className="h-3.5 w-3.5 text-neutral-500" aria-hidden />
              Testimonials
            </div>
          </div>

          <h2
            id="testimonials-heading"
            className="mt-5 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl"
          >
            What our customers say
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
            Real feedback on sarees, blouses, kurtis, and gowns—fabric, fit, and how it feels to wear
            Sawbhagya every day and on special occasions.
          </p>
        </motion.div>

        <div
          className="mx-auto mt-12 flex h-[min(740px,70svh)] max-h-[740px] w-full justify-center gap-4 overflow-hidden sm:gap-6"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={22}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={20}
          />
        </div>
      </div>
    </section>
  );
}
