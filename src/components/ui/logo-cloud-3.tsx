"use client";

import * as React from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

export type LogoCloudLogo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: LogoCloudLogo[];
  gap?: number;
  reverse?: boolean;
  duration?: number;
  durationOnHover?: number;
};

export function LogoCloud({
  className,
  logos,
  gap = 42,
  reverse = false,
  duration = 42,
  durationOnHover = 22,
  ...props
}: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black,transparent)] sm:py-4",
        className,
      )}
    >
      <InfiniteSlider gap={gap} reverse={reverse} duration={duration} durationOnHover={durationOnHover}>
        {logos.map((logo) => (
          <img
            key={`${logo.src}-${logo.alt}`}
            alt={logo.alt}
            className="pointer-events-none h-7 select-none opacity-90 contrast-[1.05] sm:h-8 md:h-9 dark:opacity-95"
            height={logo.height ?? undefined}
            width={logo.width ?? undefined}
            loading="lazy"
            src={logo.src}
            decoding="async"
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}
