"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Menu, Search, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { SITE_BRAND_NAME, SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface NavigationItem {
  name: string;
  href: string;
  featuredImageSrc?: string;
  items?: Array<{ name: string; href: string; imageSrc?: string }>;
}

interface AnnouncementBanner {
  text: string;
  linkText: string;
  linkHref: string;
}

interface CallToAction {
  text: string;
  href: string;
  variant: "primary" | "secondary";
}

interface HeroLandingProps {
  logo?: {
    src: string;
    alt: string;
    companyName: string;
  };
  navigation?: NavigationItem[];
  showHeader?: boolean;
  loginText?: string;
  loginHref?: string;
  title: string | string[];
  description: string;
  announcementBanner?: AnnouncementBanner;
  callToActions?: CallToAction[];
  titleSize?: "small" | "medium" | "large";
  gradientColors?: {
    from: string;
    to: string;
  };
  backgroundImages?: string[];
  /**
   * How background images should fit.
   * - `cover`: fills the hero, may crop (default)
   * - `contain`: shows the full image (no crop); we add a subtle blurred backdrop for nicer edges.
   */
  backgroundImageFit?: "cover" | "contain";
  /**
   * Mobile-specific fit override (<= sm breakpoint).
   * Useful when the same hero should be full-bleed on desktop but less cropped on phones.
   */
  backgroundImageFitMobile?: "cover" | "contain";
  /**
   * Per-image focal point for `object-position` on hero `<img>` (same syntax as
   * background-position). Prefer top weighting (`center top`, `50% 5%`) so faces
   * stay in frame on wide viewports with `object-cover`.
   */
  backgroundImagePositions?: string[];
  /**
   * Mobile-specific focal points (<= sm breakpoint). If omitted, we fall back to
   * `backgroundImagePositions` and then a slightly-lower default to show more outfit.
   */
  backgroundImagePositionsMobile?: string[];
  backgroundImageIntervalMs?: number;
  backgroundImageFadeMs?: number;
  /** Slow zoom on the active slide (disable for full-body category heroes). */
  backgroundImageKenBurns?: boolean;
  /** Override default min-height (default: `min-h-[100svh]`). */
  minHeightClassName?: string;
  className?: string;
}

const defaultProps: Partial<HeroLandingProps> = {
  logo: {
    src: SITE_LOGO_SRC,
    alt: SITE_LOGO_ALT,
    companyName: SITE_BRAND_NAME,
  },
  navigation: [
    { name: "Product", href: "#" },
    { name: "Features", href: "#" },
    { name: "Marketplace", href: "#" },
    { name: "Company", href: "#" },
  ],
  loginText: "Log in",
  loginHref: "#",
  titleSize: "large",
  gradientColors: {
    from: "oklch(0.646 0.222 41.116)",
    to: "oklch(0.488 0.243 264.376)",
  },
  backgroundImageIntervalMs: 4000,
  backgroundImageFadeMs: 900,
  backgroundImageKenBurns: true,
  backgroundImageFit: "cover",
  callToActions: [
    { text: "Get started", href: "#", variant: "primary" },
    { text: "Learn more", href: "#", variant: "secondary" },
  ],
};

export function HeroLanding(props: HeroLandingProps) {
  const {
    logo,
    navigation,
    showHeader,
    loginText,
    loginHref,
    title,
    description,
    announcementBanner,
    callToActions,
    titleSize,
    gradientColors,
    backgroundImages,
    backgroundImageFit,
    backgroundImageFitMobile,
    backgroundImagePositions,
    backgroundImagePositionsMobile,
    backgroundImageIntervalMs,
    backgroundImageFadeMs,
    backgroundImageKenBurns,
    minHeightClassName,
    className,
  } = { ...defaultProps, ...props };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);
  const [activeDesktopDropdownItem, setActiveDesktopDropdownItem] = useState<string | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  /**
   * `null` = show full `title` (SSR, before IO, or when typewriter should not run).
   * Once typing starts, holds the prefix string (may be "" briefly while animating).
   */
  const [typedTitle, setTypedTitle] = useState<string | null>(null);
  const [titleTypingDone, setTitleTypingDone] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const reduceMotionFramer = useReducedMotion();
  const heroRootRef = useRef<HTMLDivElement>(null);
  /** `null` until IntersectionObserver runs — avoids assuming in-view and skipping the headline. */
  const [heroInView, setHeroInView] = useState<boolean | null>(null);
  const prevHeroInView = useRef<boolean | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authAvatarUrl, setAuthAvatarUrl] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const normalizedBackgroundImages = useMemo(
    () => (backgroundImages ?? []).filter(Boolean),
    [backgroundImages],
  );

  const bgSlides = useMemo(
    () =>
      normalizedBackgroundImages.map((src, index) => ({
        src,
        posDesktop: backgroundImagePositions?.[index] ?? "center top",
        // Mobile default: slightly lower framing so outfit isn't cropped too aggressively.
        posMobile: backgroundImagePositionsMobile?.[index] ?? backgroundImagePositions?.[index] ?? "50% 22%",
      })),
    [normalizedBackgroundImages, backgroundImagePositions, backgroundImagePositionsMobile],
  );

  const [validBgSlides, setValidBgSlides] = useState(bgSlides);
  const bgFitDesktop = backgroundImageFit ?? "cover";
  const bgFit = (isMobile ? (backgroundImageFitMobile ?? bgFitDesktop) : bgFitDesktop) as "cover" | "contain";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Remove broken images so the hero never rotates into a blank slide.
  useEffect(() => {
    setValidBgSlides(bgSlides);
    if (bgSlides.length === 0) return;

    let cancelled = false;
    const pending = new Set(bgSlides.map((s) => s.src));

    for (const s of bgSlides) {
      const img = new Image();
      img.onload = () => {
        pending.delete(s.src);
      };
      img.onerror = () => {
        pending.delete(s.src);
        if (cancelled) return;
        setValidBgSlides((prev) => prev.filter((x) => x.src !== s.src));
      };
      img.src = s.src;
    }

    return () => {
      cancelled = true;
      pending.clear();
    };
  }, [bgSlides]);

  const allowedAdmins = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_CREATOR_EMAIL ?? "";
    return raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const isAdmin = !!authEmail && allowedAdmins.includes(authEmail.toLowerCase());
  const authHref =
    authReady && authEmail ? (isAdmin ? "/creator" : "/sign-in") : (loginHref ?? "/sign-in");

  useEffect(() => {
    if (!supabaseEnabled) {
      setAuthEmail(null);
      setAuthAvatarUrl(null);
      setAuthReady(true);
      return;
    }

    let cancelled = false;
    let unsub: (() => void) | null = null;

    const init = async () => {
      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          if (cancelled) return;
          const user = session?.user ?? null;
          setAuthEmail(user?.email ?? null);
          const meta = (user?.user_metadata as any) ?? {};
          setAuthAvatarUrl((meta.avatar_url ?? meta.picture ?? meta.avatar ?? null) as string | null);
        },
      );
      unsub = () => sub.subscription.unsubscribe();

      try {
        const { data } = await supabase.auth.getSession();
        if (!cancelled) {
          const user = data?.session?.user ?? null;
          setAuthEmail(user?.email ?? null);
          const meta = (user?.user_metadata as any) ?? {};
          setAuthAvatarUrl((meta.avatar_url ?? meta.picture ?? meta.avatar ?? null) as string | null);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    void init();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [allowedAdmins.length]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = heroRootRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setHeroInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setHeroInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.32,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (heroInView === null) return;

    const wasInView = prevHeroInView.current;
    prevHeroInView.current = heroInView;

    if (!heroInView) {
      if (wasInView === true) {
        setTypedTitle(null);
        setTitleTypingDone(false);
      }
      return;
    }

    if (prefersReducedMotion) {
      setTypedTitle(title);
      setTitleTypingDone(true);
      return;
    }

    setTitleTypingDone(false);

    if (!title.length) {
      setTypedTitle("");
      setTitleTypingDone(true);
      return;
    }

    setTypedTitle(title.slice(0, 1));
    let i = 1;
    const msPerChar = 38;
    const id = window.setInterval(() => {
      i += 1;
      setTypedTitle(title.slice(0, i));
      if (i >= title.length) {
        window.clearInterval(id);
        setTitleTypingDone(true);
      }
    }, msPerChar);

    return () => window.clearInterval(id);
  }, [heroInView, title, prefersReducedMotion]);

  useEffect(() => {
    if (validBgSlides.length <= 1) return;
    const interval = window.setInterval(() => {
      setBgIndex((i) => (i + 1) % validBgSlides.length);
    }, Math.max(1500, backgroundImageIntervalMs ?? 5000));

    return () => window.clearInterval(interval);
  }, [validBgSlides.length, backgroundImageIntervalMs]);

  useEffect(() => {
    if (!openDesktopDropdown) return;

    const navItem = navigation?.find((n) => n.name === openDesktopDropdown);
    const first = navItem?.items?.[0]?.name ?? null;
    setActiveDesktopDropdownItem(first);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDesktopDropdown(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openDesktopDropdown]);

  const hasImageBackground = validBgSlides.length > 0;
  const navTextClass = hasImageBackground
    ? "text-zinc-700 hover:text-zinc-900 transition-colors"
    : "text-foreground hover:text-muted-foreground transition-colors";
  const iconTextClass = hasImageBackground
    ? "text-zinc-700 hover:text-zinc-900 transition-colors"
    : "text-muted-foreground hover:text-foreground transition-colors";
  const navIconClassName = "h-[18px] w-[18px] sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px]";
  const isShopItem = (item: NavigationItem) => item.name.toLowerCase() === "shop";
  const isCartItem = (item: NavigationItem) => item.name.toLowerCase() === "cart";
  const titleTextClass = hasImageBackground ? "text-[#F7F3EE]" : "text-foreground";
  const descTextClass = hasImageBackground ? "text-[#E7DFD6]" : "text-muted-foreground";

  const getTitleSizeClasses = () => {
    switch (titleSize) {
      case "small":
        return "text-2xl sm:text-3xl md:text-5xl lg:text-6xl";
      case "medium":
        return "text-2xl sm:text-4xl md:text-6xl lg:text-7xl";
      case "large":
      default:
        return "text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl";
    }
  };

  const renderCallToAction = (cta: CallToAction, index: number) => {
    const motionOff = Boolean(reduceMotionFramer);
    if (cta.variant === "primary") {
      return (
        <motion.a
          key={`${cta.text}-${index}`}
          href={cta.href}
          className={[
            "inline-flex w-full items-center justify-center rounded-full px-7 py-3 font-sans-explicit text-xs font-bold uppercase tracking-[0.14em] sm:w-auto sm:py-2.5",
            "shadow-sm transition-colors",
            hasImageBackground
              ? "bg-white text-black hover:bg-white/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          ].join(" ")}
          whileHover={
            motionOff ? undefined : { scale: 1.04, y: -2, transition: { type: "spring", stiffness: 420, damping: 22 } }
          }
          whileTap={motionOff ? undefined : { scale: 0.97 }}
        >
          {cta.text}
        </motion.a>
      );
    } else {
      return (
        <motion.a
          key={`${cta.text}-${index}`}
          href={cta.href}
          className={[
            "inline-flex w-full items-center justify-center rounded-full px-5 py-3 font-sans-explicit text-sm font-medium sm:w-auto sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm/6",
            hasImageBackground ? "bg-white/10 ring-1 ring-white/20 backdrop-blur sm:ring-0" : "bg-black/5 ring-1 ring-black/10 sm:ring-0",
            hasImageBackground ? "text-white/85 hover:text-white" : "text-foreground hover:text-muted-foreground",
          ].join(" ")}
          whileHover={motionOff ? undefined : { x: 4 }}
          whileTap={motionOff ? undefined : { scale: 0.98 }}
        >
          {cta.text} <span aria-hidden="true" className="ml-1">→</span>
        </motion.a>
      );
    }
  };

  return (
    <div
      ref={heroRootRef}
      className={`${minHeightClassName ?? "min-h-[100svh]"} w-full overflow-hidden relative isolate ${className || ""}`}
    >
      {validBgSlides.length > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {bgFit === "contain" && (
            <>
              <div className="absolute inset-0 bg-neutral-950" />
              {validBgSlides.map((s, index) => (
                // eslint-disable-next-line @next/next/no-img-element -- backdrop layer only
                <img
                  key={`backdrop-${s.src}-${index}`}
                  src={s.src}
                  alt=""
                  decoding="async"
                  fetchPriority="low"
                  className={[
                    "absolute inset-0 h-full w-full origin-center object-contain",
                    "scale-[1.14] blur-3xl opacity-75",
                    "transition-opacity motion-reduce:transition-none",
                    index === (bgIndex % validBgSlides.length) ? "opacity-75" : "opacity-0",
                  ].join(" ")}
                  style={{
                    objectPosition: isMobile ? s.posMobile : s.posDesktop,
                    transitionDuration: `${Math.max(0, backgroundImageFadeMs ?? 900)}ms`,
                    filter: "saturate(1.08) contrast(1.05)",
                  }}
                />
              ))}
              <div className="absolute inset-0 bg-black/10" />
            </>
          )}
          {validBgSlides.map((s, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- full-bleed hero carousel; LCP handled by first slide
            <img
              key={`${s.src}-${index}`}
              src={s.src}
              alt=""
              decoding={index === 0 ? "sync" : "async"}
              fetchPriority={index === 0 ? "high" : "low"}
              className={[
                "absolute inset-0 h-full w-full will-change-transform will-change-opacity",
                bgFit === "contain" ? "object-contain" : "object-cover",
                "origin-top motion-reduce:origin-center",
                "transition-[opacity,transform] motion-reduce:transition-none",
                index === (bgIndex % validBgSlides.length) ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                objectPosition: isMobile ? s.posMobile : s.posDesktop,
                transitionDuration: `${Math.max(0, backgroundImageFadeMs ?? 900)}ms`,
                transformOrigin: bgFit === "contain" ? "center center" : "top center",
                animation:
                  index === (bgIndex % validBgSlides.length) &&
                  !reduceMotionFramer &&
                  bgFit !== "contain" &&
                  backgroundImageKenBurns !== false
                    ? "kenburns-slow 12s ease-out both"
                    : undefined,
                filter: "saturate(1.08) contrast(1.08)",
              }}
            />
          ))}
          {/* keep background clean; only a subtle bottom fade for text */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />
        </div>
      )}

      {!hasImageBackground && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 min-h-screen"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                background: `linear-gradient(to top right, ${gradientColors?.from}, ${gradientColors?.to})`,
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] min-h-screen"
            />
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] min-h-screen"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                background: `linear-gradient(to top right, ${gradientColors?.from}, ${gradientColors?.to})`,
              }}
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] min-h-screen"
            />
          </div>
        </>
      )}

      {showHeader === false ? null : (
        <header className="absolute inset-x-0 top-0 z-20">
          <nav
            aria-label="Global"
            className="grid min-h-0 grid-cols-[44px_1fr_44px] items-center gap-3 overflow-visible bg-white px-2 py-1 shadow-sm ring-1 ring-black/5 sm:px-3 sm:py-1.5 lg:flex lg:justify-between lg:gap-6 lg:px-5"
          >
            {/* Mobile: menu button left so logo can be centered */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className={`-m-2 inline-flex items-center justify-center rounded-md p-2 ${iconTextClass}`}
              >
                <span className="sr-only">Open main menu</span>
                <Menu aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-center lg:justify-start lg:pr-8 xl:pr-12">
              <a href="/" className="-m-0.5 shrink-0 p-0.5">
                <img
                  alt={logo?.alt ?? logo?.companyName ?? "Sawbhagya"}
                  src={logo?.src}
                  className="h-24 w-auto -my-1 object-contain sm:h-16 sm:-my-1.5 md:h-[4rem] md:-my-2 lg:h-20 lg:-my-2.5 xl:h-24 xl:-my-3"
                  style={hasImageBackground ? { filter: "brightness(1.15) contrast(1.1)" } : undefined}
                />
              </a>
            </div>
            {/* Mobile: right slot (cart if available, otherwise spacer) */}
            <div className="flex items-center justify-end lg:hidden">
              {navigation?.find(isCartItem) ? (
                <motion.a
                  href={navigation.find(isCartItem)!.href}
                  className={iconTextClass}
                  whileTap={reduceMotionFramer ? undefined : { scale: 0.97 }}
                  aria-label="Cart"
                  title="Cart"
                >
                  <ShoppingCart className={navIconClassName} aria-hidden="true" />
                </motion.a>
              ) : (
                <div className="h-9 w-9" aria-hidden="true" />
              )}
            </div>
            {navigation && navigation.length > 0 && (
              <div className="hidden shrink-0 lg:flex lg:gap-x-6 xl:gap-x-8">
                {navigation.filter((item) => !isShopItem(item) && !isCartItem(item)).map((item) =>
                  item.items && item.items.length > 0 ? (
                    <div
                      key={item.name}
                      className="relative py-1 -my-1"
                      onPointerEnter={() => setOpenDesktopDropdown(item.name)}
                      onPointerLeave={() => setOpenDesktopDropdown((v) => (v === item.name ? null : v))}
                    >
                      <a
                        href={item.href}
                        className={`text-[11px] font-bold tracking-[0.12em] uppercase lg:text-xs xl:text-sm ${navTextClass} inline-flex items-center gap-1`}
                        aria-haspopup="menu"
                        aria-expanded={openDesktopDropdown === item.name}
                      >
                        {item.name}
                        <span aria-hidden="true" className="translate-y-[-1px] opacity-80">
                          ▾
                        </span>
                      </a>
                      <div className={`absolute left-0 top-full z-50 pt-2 ${openDesktopDropdown === item.name ? "" : "pointer-events-none"}`}>
                        <div
                          className={[
                            "pointer-events-auto w-[34rem] overflow-hidden rounded-2xl border shadow-xl",
                            openDesktopDropdown === item.name
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-1",
                            "transition duration-150",
                            hasImageBackground
                              ? "border-white/15 bg-black/70 backdrop-blur"
                              : "border-black/10 bg-white/95 backdrop-blur",
                          ].join(" ")}
                          role="menu"
                        >
                        <div className="grid grid-cols-[1fr_12.5rem] gap-0">
                          <div className="p-2">
                            {item.items.map((sub) => {
                              const isActive = activeDesktopDropdownItem === sub.name;
                              return (
                                <a
                                  key={`${item.name}-${sub.name}`}
                                  href={sub.href}
                                  role="menuitem"
                                  onPointerEnter={() => setActiveDesktopDropdownItem(sub.name)}
                                  className={[
                                    "block rounded-xl px-3 py-2 text-sm font-medium",
                                    isActive
                                      ? hasImageBackground
                                        ? "bg-white/12 text-white"
                                        : "bg-black/5 text-neutral-900"
                                      : hasImageBackground
                                        ? "text-white/90 hover:text-white hover:bg-white/10"
                                        : "text-neutral-900 hover:bg-black/5",
                                    "transition-colors",
                                  ].join(" ")}
                                >
                                  {sub.name}
                                </a>
                              );
                            })}
                          </div>
                          <div className={hasImageBackground ? "border-l border-white/10" : "border-l border-black/10"}>
                            <div className="p-2">
                              {(() => {
                                const active =
                                  item.items?.find((x) => x.name === activeDesktopDropdownItem) ??
                                  item.items?.[0];
                                const src = active?.imageSrc ?? item.featuredImageSrc;
                                if (!src) return null;
                                // eslint-disable-next-line @next/next/no-img-element
                                return (
                                  <img
                                    src={src}
                                    alt=""
                                    className="h-40 w-full rounded-xl object-cover"
                                    style={hasImageBackground ? { filter: "saturate(1.05) contrast(1.05)" } : undefined}
                                  />
                                );
                              })()}
                              <div className={hasImageBackground ? "mt-2 text-xs text-white/70" : "mt-2 text-xs text-neutral-500"}>
                                {item.name}
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      className={[
                        "inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase lg:text-xs xl:text-sm",
                        navTextClass,
                      ].join(" ")}
                      whileHover={reduceMotionFramer ? undefined : { y: -2 }}
                      whileTap={reduceMotionFramer ? undefined : { scale: 0.97 }}
                      aria-label={item.name}
                    >
                      {item.name}
                    </motion.a>
                  ),
                )}
              </div>
            )}
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-4 xl:gap-6">
              <HeroSearchBar hasImageBackground={hasImageBackground} reduceMotion={Boolean(reduceMotionFramer)} />
              {(navigation?.some(isShopItem) || navigation?.some(isCartItem) || (loginText && loginHref)) ? (
                <div className="flex items-center gap-3">
                  {navigation?.find(isShopItem) ? (
                    <motion.a
                      href={navigation.find(isShopItem)!.href}
                      className={iconTextClass}
                      whileHover={reduceMotionFramer ? undefined : { y: -2 }}
                      whileTap={reduceMotionFramer ? undefined : { scale: 0.97 }}
                      aria-label="Shop"
                      title="Shop"
                    >
                      <ShoppingBag className={navIconClassName} aria-hidden="true" />
                    </motion.a>
                  ) : null}
                  {navigation?.find(isCartItem) ? (
                    <motion.a
                      href={navigation.find(isCartItem)!.href}
                      className={iconTextClass}
                      whileHover={reduceMotionFramer ? undefined : { y: -2 }}
                      whileTap={reduceMotionFramer ? undefined : { scale: 0.97 }}
                      aria-label="Cart"
                      title="Cart"
                    >
                      <ShoppingCart className={navIconClassName} aria-hidden="true" />
                    </motion.a>
                  ) : null}
                  {loginText && loginHref ? (
                    <a
                      href={authHref}
                      className={[
                        "inline-flex items-center gap-2 transition-colors",
                        authReady && authEmail ? "rounded-full bg-white/70 px-2 py-1.5 ring-1 ring-black/10 hover:bg-white" : "",
                        `text-[11px] font-bold tracking-[0.12em] uppercase lg:text-xs xl:text-sm ${navTextClass}`,
                      ].join(" ")}
                      aria-label={authReady && authEmail ? `Account ${authEmail}` : loginText}
                      title={authReady && authEmail ? authEmail ?? undefined : undefined}
                    >
                      {authReady && authEmail ? (
                        <>
                          <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-black/5 ring-1 ring-black/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {authAvatarUrl ? (
                              <img src={authAvatarUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[11px] font-bold text-neutral-700">
                                {(authEmail?.[0] ?? "U").toUpperCase()}
                              </span>
                            )}
                          </span>
                          <span className="max-w-[160px] truncate normal-case tracking-normal text-neutral-900 lg:max-w-[220px]">
                            {authEmail}
                          </span>
                        </>
                      ) : (
                        loginText
                      )}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </nav>
          <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            {mobileMenuOpen ? (
              <DialogContent className="fixed inset-y-0 left-0 z-50 h-full w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-white px-6 py-6 data-[state=open]:slide-in-from-left sm:right-auto sm:top-0 sm:max-w-sm sm:rounded-none sm:border-r sm:border-black/10 lg:hidden [&>button]:hidden">
                <DialogTitle className="sr-only">Menu</DialogTitle>
                <div className="flex items-center justify-between">
                  <a href="/" className="-m-1.5 p-1.5">
                    <span className="sr-only">{logo?.companyName}</span>
                    <img alt={logo?.alt} src={logo?.src} className="h-10 w-auto" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-m-2.5 rounded-md p-2.5 text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    <span className="sr-only">Close menu</span>
                    <X aria-hidden="true" className="size-6" />
                  </button>
                </div>
                <div className="mt-8 flow-root">
                  <div className="-my-6 divide-y divide-black/10">
                    <div className="py-6">
                      <form
                        action="/"
                        method="get"
                        className="flex items-center gap-3 rounded-full border border-black/10 bg-neutral-50/50 px-4 py-2.5"
                      >
                        <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                        <input
                          type="search"
                          name="q"
                          placeholder="Search products…"
                          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 outline-none"
                        />
                      </form>
                    </div>
                    {navigation && navigation.length > 0 && (
                      <div className="space-y-1 py-6">
                        {navigation.map((item) =>
                          item.items && item.items.length > 0 ? (
                            <div key={item.name} className="space-y-2 pb-4 pt-2">
                              <a
                                href={item.href}
                                className="block text-xs font-bold uppercase tracking-wider text-neutral-900"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {item.name}
                              </a>
                              <div className="ml-2 flex flex-col gap-3 border-l-2 border-neutral-100 pl-4 pt-2">
                                {item.items.map((sub) => (
                                  <a
                                    key={`${item.name}-${sub.name}`}
                                    href={sub.href}
                                    className="block text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {sub.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <a
                              key={item.name}
                              href={item.href}
                              className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-50 transition-colors"
                              aria-label={item.name}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {isShopItem(item) ? (
                                <>
                                  <ShoppingBag className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                                  <span>Shop</span>
                                </>
                              ) : isCartItem(item) ? (
                                <>
                                  <ShoppingCart className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                                  <span>Cart</span>
                                </>
                              ) : (
                                item.name
                              )}
                            </a>
                          ),
                        )}
                      </div>
                    )}
                    {loginText && loginHref && (
                      <div className="py-6">
                        <a
                          href={authHref}
                          className="flex w-full items-center justify-center rounded-full bg-neutral-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-800"
                        >
                          {authReady && authEmail ? (
                            <span className="flex items-center gap-3">
                              <span className="relative grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {authAvatarUrl ? (
                                  <img src={authAvatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-bold text-white">
                                    {(authEmail?.[0] ?? "U").toUpperCase()}
                                  </span>
                                )}
                              </span>
                              <span className="truncate">
                                {authEmail}
                              </span>
                            </span>
                          ) : (
                            loginText
                          )}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            ) : null}
          </Dialog>
        </header>
      )}

      <div className="relative z-10 px-6 pt-4 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="mx-auto w-full max-w-6xl pt-24 sm:pt-32">
          {announcementBanner && (
            <div className="hidden sm:mb-8 sm:flex sm:justify-center sm:items-center">
              <div
                className={[
                  "relative inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm/6",
                  "font-sans-explicit",
                  hasImageBackground
                    ? "text-white/90 bg-black/30 backdrop-blur-md hover:bg-black/40"
                    : "text-muted-foreground bg-background/60 hover:bg-background/80",
                  hasImageBackground
                    ? "border border-white/30"
                    : "border border-black/15",
                  "transition-colors",
                ].join(" ")}
              >
                {announcementBanner.text}{" "}
                <a
                  href={announcementBanner.linkHref}
                  className={[
                    "ml-1 font-semibold tracking-[0.03em]",
                    hasImageBackground ? "text-white hover:text-white/90" : "text-primary hover:text-primary/80",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="absolute inset-0" />
                  {announcementBanner.linkText}{" "}
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          )}

          <div className="mx-auto max-w-4xl text-center">
            {hasImageBackground && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[520px] max-w-5xl rounded-[2rem] sm:h-[560px] [background:radial-gradient(60%_60%_at_50%_35%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.20)_35%,rgba(0,0,0,0.10)_60%,rgba(0,0,0,0.0)_100%)]"
              />
            )}
            <motion.h1
              className={[
                getTitleSizeClasses(),
                "hero-heading font-bold",
                hasImageBackground ? "drop-shadow-[0_10px_32px_rgba(0,0,0,0.35)]" : "",
                titleTextClass,
              ].join(" ")}
              aria-label={Array.isArray(title) ? title.join(" ") : title}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              {Array.isArray(title) ? (
                title.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))
              ) : (
                title
              )}
            </motion.h1>
            <p
              className={[
                "mt-5 sm:mt-7 mx-auto max-w-2xl font-sans-explicit",
                "text-base sm:text-lg font-medium text-pretty sm:text-lg/8 lg:text-xl/9 xl:text-2xl/9",
                "tracking-[0.01em]",
                hasImageBackground ? "drop-shadow-[0_8px_22px_rgba(0,0,0,0.35)]" : "",
                descTextClass,
              ].join(" ")}
            >
              {description}
            </p>

            {callToActions && callToActions.length > 0 && (
              <div className="mt-8 sm:mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-x-8">
                {callToActions.map((cta, index) => renderCallToAction(cta, index))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { HeroLandingProps, NavigationItem, AnnouncementBanner, CallToAction };

/** ───────────────────────────────────────────────────────────────────────────
 * HeroSearchBar
 * Collapsed = single Search icon; click expands a minimal bottom-border input.
 * Icon is identical in size to ShoppingBag / ShoppingCart for visual balance.
 * ──────────────────────────────────────────────────────────────────────────── */
function HeroSearchBar({
  hasImageBackground,
  reduceMotion,
}: {
  hasImageBackground: boolean;
  reduceMotion: boolean;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const iconClass = "h-[18px] w-[18px] sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px]";

  return (
    <div className="hidden lg:flex lg:items-center">
      <div className="relative flex items-center justify-end">
        <form
          action="/"
          method="get"
          className={[
            "flex items-center overflow-hidden transition-all duration-300 ease-out",
            open ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none",
            "mr-1",
          ].join(" ")}
          onSubmit={() => setOpen(false)}
        >
          <div
            className="flex w-full items-center gap-2 border-b border-zinc-400 pb-0.5"
          >
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Search sarees, blouses…"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-xs text-zinc-800 outline-none lg:text-sm font-sans-explicit placeholder:font-light placeholder:text-zinc-400"
            />
          </div>
        </form>

        <button
          type="button"
          aria-label={open ? "Close search" : "Open search"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center transition-colors text-zinc-800 hover:text-zinc-900"
        >
          {open ? (
            <X className={iconClass} strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Search className={iconClass} strokeWidth={2.5} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
