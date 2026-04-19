"use client";

import { Sparkles } from "lucide-react";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import type { LogoCloudLogo } from "@/components/ui/logo-cloud-3";
import { cn } from "@/lib/utils";

/** Wide fabric / craft detail crops — read as “texture & quality” rather than third-party brands */
const TRUST_LOGOS: LogoCloudLogo[] = [
  {
    src: "https://images.unsplash.com/photo-1617032215657-7b9559e8a10e?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Silk weave detail",
    width: 200,
    height: 72,
  },
  {
    src: "https://images.unsplash.com/photo-1584990347449-a8b291f50c00?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Handloom cotton texture",
    width: 200,
    height: 72,
  },
  {
    src: "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Embroidery and threadwork",
    width: 200,
    height: 72,
  },
  {
    src: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Linen and natural fibres",
    width: 200,
    height: 72,
  },
  {
    src: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Drape and pleats",
    width: 200,
    height: 72,
  },
  {
    src: "https://images.unsplash.com/photo-1583496661160-fb5886b0aa0a?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Festive colour palette",
    width: 200,
    height: 72,
  },
  {
    src: "https://images.unsplash.com/photo-1598550476439-684778247f2d?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Zari and metallic accents",
    width: 200,
    height: 72,
  },
  {
    src: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=320&h=120&q=70",
    alt: "Tailored finishing",
    width: 200,
    height: 72,
  },
];

export function HomeTrustLogoCloud() {
  return (
    <section
      className="surface-texture relative border-b border-black/5 py-10 sm:py-12"
      aria-labelledby="trust-marquee-heading"
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 -z-10 h-[min(420px,55vw)] w-[min(900px,120vw)] -translate-x-1/2 rounded-full",
          "bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06),transparent_62%)] blur-2xl",
        )}
      />

      <div className="relative mx-auto max-w-3xl px-4">
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-600/90" aria-hidden />
            Craft & quality
          </span>
        </div>

        <h2
          id="trust-marquee-heading"
          className="text-center text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl md:text-2xl"
        >
          <span className="text-neutral-600">Rooted in fabric-first design.</span>
          <br />
          <span className="text-neutral-900">Worn by customers who care how it feels.</span>
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-neutral-600">
          From Banarasi zari to breathable linen—every drop is photographed honestly and finished for
          real wardrobes, weddings, and work weeks.
        </p>

        <div className="mx-auto my-5 h-px max-w-sm bg-black/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

        <LogoCloud logos={TRUST_LOGOS} gap={36} reverse duration={46} durationOnHover={24} />

        <div className="mx-auto mt-5 h-px max-w-sm bg-black/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      </div>
    </section>
  );
}
