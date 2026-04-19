"use client";

import type { LucideIcon } from "lucide-react";
import {
  Gem,
  Leaf,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Truck,
  Palette,
} from "lucide-react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type FabricFeature = { icon: LucideIcon; label: string; sub: string };

const FEATURES: FabricFeature[] = [
  { icon: Gem, label: "Premium fabrics", sub: "Silk · linen · georgette" },
  { icon: Scissors, label: "Thoughtful tailoring", sub: "Blouses & fits" },
  { icon: Leaf, label: "Breathable weaves", sub: "All-day comfort" },
  { icon: Palette, label: "True-to-tone colours", sub: "Honest photography" },
  { icon: Truck, label: "Reliable dispatch", sub: "Tracked delivery" },
  { icon: ShieldCheck, label: "Quality first", sub: "Curated, not fast fashion" },
  { icon: Ruler, label: "Consistent sizing", sub: "Clear size notes" },
  { icon: Sparkles, label: "Occasion-ready", sub: "Work to wedding" },
];

function FeaturePill({ item }: { item: FabricFeature }) {
  const Icon = item.icon;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3 rounded-2xl border border-black/10 bg-white/95 px-4 py-3 shadow-sm ring-1 ring-black/[0.04]",
        "transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900/5 text-neutral-800">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-xs font-semibold tracking-tight text-neutral-900">{item.label}</span>
        <span className="mt-0.5 block text-[11px] text-neutral-500">{item.sub}</span>
      </span>
    </div>
  );
}

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
            Fabric & quality
          </span>
        </div>

        <h2
          id="trust-marquee-heading"
          className="text-center font-serif text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl md:text-2xl"
        >
          <span className="text-neutral-600">Rooted in fabric-first design.</span>
          <br />
          <span className="text-neutral-900">Worn by customers who care how it feels.</span>
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-center font-serif text-sm leading-relaxed text-neutral-600 sm:text-base">
          From Banarasi zari to breathable linen—every piece is photographed honestly and finished for real
          wardrobes, weddings, and work weeks.
        </p>

        <div className="mx-auto my-5 h-px max-w-sm bg-black/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

        <div className="[mask-image:linear-gradient(to_right,transparent,black,transparent)]">
          <InfiniteSlider gap={20} reverse duration={48} durationOnHover={26}>
            {FEATURES.map((item) => (
              <FeaturePill key={item.label} item={item} />
            ))}
          </InfiniteSlider>
        </div>

        <div className="mx-auto mt-5 h-px max-w-sm bg-black/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      </div>
    </section>
  );
}
