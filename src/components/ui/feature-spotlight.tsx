"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export type FeaturedSpotlightProps = {
  label?: string;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  ctaText?: string;
  mediaType?: "image" | "video";
  mediaSrc?: string;
  mediaAlt?: string;
  videoPosterSrc?: string;
  indexLabel?: string;
  onClick?: () => void;
  /** Rendered directly under the Shop / Explore CTA (e.g. subcategory pills). */
  afterCta?: ReactNode;
};

export function FeaturedSpotlight({
  label = "Featured",
  titleLine1 = "Modern",
  titleLine2 = "Living",
  description = "Where architecture meets the natural world.",
  ctaText = "Explore",
  mediaType = "image",
  mediaSrc = "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=2307&q=80",
  mediaAlt = "Featured media",
  videoPosterSrc,
  indexLabel = "01",
  onClick,
  afterCta,
}: FeaturedSpotlightProps) {
  const [isHovered, setIsHovered] = useState(false);
  const spotlightRootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const tryPlayVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el || mediaType !== "video") return;
    el.muted = true;
    el.setAttribute("muted", "");
    void el.play().catch(() => {});
  }, [mediaType]);

  useEffect(() => {
    tryPlayVideo();
  }, [mediaSrc, tryPlayVideo]);

  useEffect(() => {
    const root = spotlightRootRef.current;
    if (!root || mediaType !== "video") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) tryPlayVideo();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [mediaType, mediaSrc, tryPlayVideo]);

  return (
    <div
      ref={spotlightRootRef}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="group relative flex cursor-pointer flex-col items-center gap-8 md:flex-row md:items-start md:gap-12 lg:gap-16"
      onMouseEnter={() => {
        setIsHovered(true);
        tryPlayVideo();
      }}
      onTouchStart={() => tryPlayVideo()}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      {/* Left: Text Block */}
      <div className="relative z-10 flex w-full max-w-[360px] shrink-0 flex-col items-center text-center md:w-[280px] md:items-start md:text-left lg:w-[320px] lg:pt-4">
        {/* Label with animated line */}
        <div className="mb-6 flex items-center gap-3 md:mb-8 md:gap-4">
          <div
            className="h-px bg-foreground transition-all duration-700"
            style={{
              width: isHovered ? 48 : 32,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          <span
            className="text-[10px] font-medium uppercase tracking-[0.25em] text-foreground transition-all duration-700 md:text-xs"
            style={{
              letterSpacing: isHovered ? "0.3em" : "0.25em",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {label}
          </span>
        </div>

        {/* Title - responsive text sizes */}
        <h2 className="relative">
          <span
            className="block text-4xl font-normal tracking-tight text-foreground transition-all duration-700 sm:text-5xl md:text-5xl lg:text-6xl"
            style={{
              transform: isHovered ? "translateY(-2px)" : "translateY(0)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {titleLine1}
          </span>
          <span
            className="block text-4xl font-normal tracking-tight text-foreground transition-all duration-700 sm:text-5xl md:text-5xl lg:text-6xl"
            style={{
              transform: isHovered ? "translateX(12px)" : "translateX(0)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {titleLine2}
          </span>
        </h2>

        {/* Description - responsive spacing */}
        <p
          className="mt-6 max-w-[260px] text-sm leading-relaxed transition-all duration-700 md:mt-8 md:max-w-[220px] md:text-base lg:mt-10 lg:max-w-[240px]"
          style={{
            color: isHovered
              ? "hsl(var(--muted-foreground))"
              : "hsl(var(--muted-foreground) / 0.6)",
            transform: isHovered ? "translateY(-4px)" : "translateY(0)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {description}
        </p>

        {/* Minimal CTA - responsive spacing */}
        <div className="mt-6 flex items-center gap-4 md:mt-8 lg:mt-10">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 md:h-11 md:w-11 lg:h-12 lg:w-12"
            style={{
              borderColor: isHovered
                ? "hsl(var(--foreground))"
                : "hsl(var(--muted-foreground) / 0.3)",
              backgroundColor: isHovered ? "hsl(var(--foreground))" : "transparent",
              color: isHovered ? "hsl(var(--background))" : "hsl(var(--foreground))",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              boxShadow: isHovered ? "0 8px 32px hsl(var(--foreground) / 0.15)" : "0 0 0 transparent",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-500 md:h-4 md:w-4"
              style={{
                transform: isHovered ? "rotate(45deg)" : "rotate(0deg)",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
          <span
            className="text-[10px] font-medium uppercase tracking-widest transition-all duration-700 md:text-xs"
            style={{
              opacity: isHovered ? 1 : 0.5,
              transform: isHovered ? "translateX(0)" : "translateX(-8px)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: isHovered ? "100ms" : "0ms",
            }}
          >
            {ctaText}
          </span>
        </div>

        {afterCta ? (
          <div className="mt-6 w-full max-w-[min(100%,520px)] md:mt-8 md:max-w-none">{afterCta}</div>
        ) : null}
      </div>

      {/* Right: Image Block */}
      <div
        className="relative transition-all duration-700 md:ml-auto md:translate-x-6 md:-translate-y-6 lg:mr-2 lg:translate-x-12 lg:-translate-y-10"
        style={{
          transform: isHovered ? "translateX(4px) translateY(-4px)" : "translateX(0) translateY(0)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Frame outline */}
        <div
          className="absolute -inset-3 border transition-all duration-700 md:-inset-4"
          style={{
            borderColor: isHovered ? "hsl(var(--foreground) / 0.15)" : "transparent",
            transform: isHovered ? "scale(1.01)" : "scale(1)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Image container - responsive sizing */}
        <div className="relative h-[340px] w-[320px] overflow-hidden sm:h-[420px] sm:w-[380px] md:h-[520px] md:w-[460px] lg:h-[620px] lg:w-[560px]">
          <div
            className="absolute -inset-1 transition-all duration-700"
            style={{
              boxShadow: isHovered ? "0 24px 64px hsl(var(--foreground) / 0.1)" : "0 0 0 transparent",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          {mediaType === "video" && mediaSrc ? (
            <video
              ref={videoRef}
              key={mediaSrc}
              className="h-full w-full object-cover transition-all duration-1000"
              style={{
                transform: isHovered ? "scale(1.03)" : "scale(1)",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              poster={videoPosterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={tryPlayVideo}
              onCanPlay={tryPlayVideo}
            >
              <source src={mediaSrc} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaSrc}
              alt={mediaAlt}
              className="h-full w-full object-cover transition-all duration-1000"
              style={{
                transform: isHovered ? "scale(1.03)" : "scale(1)",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          )}

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent transition-opacity duration-700 pointer-events-none"
            style={{
              opacity: isHovered ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          {/* Corner accents */}
          <div
            className="pointer-events-none absolute left-2 top-2 h-5 w-px bg-white/80 transition-all duration-500 md:left-3 md:top-3 md:h-6"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "top",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "50ms",
            }}
          />
          <div
            className="pointer-events-none absolute left-2 top-2 h-px w-5 bg-white/80 transition-all duration-500 md:left-3 md:top-3 md:w-6"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "100ms",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-2 right-2 h-5 w-px bg-white/80 transition-all duration-500 md:bottom-3 md:right-3 md:h-6"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: "bottom",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "150ms",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-2 right-2 h-px w-5 bg-white/80 transition-all duration-500 md:bottom-3 md:right-3 md:w-6"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "right",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: "200ms",
            }}
          />
        </div>

        {/* Index number */}
        <span
          className="absolute -bottom-6 right-0 font-mono text-xs text-muted-foreground transition-all duration-700 md:-bottom-8 md:text-sm"
          style={{
            opacity: isHovered ? 1 : 0.4,
            transform: isHovered ? "translateY(12px)" : "translateY(0)",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {indexLabel}
        </span>
      </div>
    </div>
  );
}
