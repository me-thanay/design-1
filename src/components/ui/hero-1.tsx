"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Menu, ShoppingBag, ShoppingCart, X } from "lucide-react";
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
  title: string;
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
   * Per-image focal point for `object-position` on hero `<img>` (same syntax as
   * background-position). Prefer top weighting (`center top`, `50% 5%`) so faces
   * stay in frame on wide viewports with `object-cover`.
   */
  backgroundImagePositions?: string[];
  backgroundImageIntervalMs?: number;
  backgroundImageFadeMs?: number;
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
    backgroundImagePositions,
    backgroundImageIntervalMs,
    backgroundImageFadeMs,
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
  const [authReady, setAuthReady] = useState(false);

  const normalizedBackgroundImages = useMemo(
    () => (backgroundImages ?? []).filter(Boolean),
    [backgroundImages],
  );

  const allowedAdmins = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_CREATOR_EMAIL ?? "";
    return raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const isAdmin = !!authEmail && allowedAdmins.includes(authEmail.toLowerCase());

  useEffect(() => {
    if (!supabaseEnabled) {
      setAuthEmail(null);
      setAuthReady(true);
      return;
    }

    let cancelled = false;
    let unsub: (() => void) | null = null;

    const init = async () => {
      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          if (!cancelled) setAuthEmail(session?.user?.email ?? null);
        },
      );
      unsub = () => sub.subscription.unsubscribe();

      try {
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setAuthEmail(data?.session?.user?.email ?? null);
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
    if (normalizedBackgroundImages.length <= 1) return;
    const interval = window.setInterval(() => {
      setBgIndex((i) => (i + 1) % normalizedBackgroundImages.length);
    }, Math.max(1500, backgroundImageIntervalMs ?? 5000));

    return () => window.clearInterval(interval);
  }, [normalizedBackgroundImages.length, backgroundImageIntervalMs]);

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

  const hasImageBackground = normalizedBackgroundImages.length > 0;
  const navTextClass = hasImageBackground
    ? "text-zinc-700 hover:text-zinc-900 transition-colors"
    : "text-foreground hover:text-muted-foreground transition-colors";
  const iconTextClass = hasImageBackground
    ? "text-zinc-700 hover:text-zinc-900 transition-colors"
    : "text-muted-foreground hover:text-foreground transition-colors";
  const navIconClassName = "h-5 w-5 sm:h-[22px] sm:w-[22px] lg:h-6 lg:w-6";
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
            "rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold",
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
            "text-xs sm:text-sm/6 font-semibold transition-colors",
            hasImageBackground ? "text-white/90 hover:text-white" : "text-foreground hover:text-muted-foreground",
          ].join(" ")}
          whileHover={motionOff ? undefined : { x: 4 }}
          whileTap={motionOff ? undefined : { scale: 0.98 }}
        >
          {cta.text} <span aria-hidden="true">→</span>
        </motion.a>
      );
    }
  };

  return (
    <div
      ref={heroRootRef}
      className={`min-h-[100svh] w-full overflow-hidden relative isolate ${className || ""}`}
    >
      {normalizedBackgroundImages.length > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {normalizedBackgroundImages.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- full-bleed hero carousel; LCP handled by first slide
            <img
              key={`${src}-${index}`}
              src={src}
              alt=""
              decoding={index === 0 ? "sync" : "async"}
              fetchPriority={index === 0 ? "high" : "low"}
              className={[
                "absolute inset-0 h-full w-full object-cover will-change-transform will-change-opacity",
                "origin-top motion-reduce:origin-center",
                "transition-[opacity,transform] motion-reduce:transition-none",
                index === (bgIndex % normalizedBackgroundImages.length)
                  ? "opacity-100 scale-[1.02] motion-reduce:scale-100"
                  : "opacity-0 scale-[1.01] motion-reduce:scale-100",
              ].join(" ")}
              style={{
                objectPosition: backgroundImagePositions?.[index] ?? "center top",
                transitionDuration: `${Math.max(0, backgroundImageFadeMs ?? 900)}ms`,
                animation:
                  index === (bgIndex % normalizedBackgroundImages.length) && !reduceMotionFramer
                    ? "kenburns-slow 10s linear both"
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
            className="flex min-h-0 items-center justify-between gap-3 overflow-visible bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/5 sm:px-3 sm:py-2 lg:gap-6 lg:px-5"
          >
            <div className="flex min-w-0 flex-1 items-center lg:pr-8 xl:pr-12">
              <a href="/" className="-m-0.5 shrink-0 p-0.5">
                <img
                  alt={logo?.alt ?? logo?.companyName ?? "Sawbhagya"}
                  src={logo?.src}
                  className="h-14 w-auto -my-1 object-contain sm:h-16 sm:-my-1.5 md:h-[4.5rem] md:-my-2 lg:h-24 lg:-my-3 xl:h-28 xl:-my-3.5"
                  style={hasImageBackground ? { filter: "brightness(1.15) contrast(1.1)" } : undefined}
                />
              </a>
            </div>
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
                      <button
                        type="button"
                        className={`text-[11px] font-bold tracking-[0.12em] uppercase lg:text-xs xl:text-sm ${navTextClass} inline-flex items-center gap-1`}
                        aria-haspopup="menu"
                        aria-expanded={openDesktopDropdown === item.name}
                      >
                        {item.name}
                        <span aria-hidden="true" className="translate-y-[-1px] opacity-80">
                          ▾
                        </span>
                      </button>
                      <div className="absolute left-0 top-full z-50 pt-2">
                        <div
                          className={[
                            "pointer-events-auto w-[34rem] overflow-hidden rounded-2xl border shadow-xl",
                            openDesktopDropdown === item.name
                              ? "opacity-100 translate-y-0"
                              : "pointer-events-none opacity-0 translate-y-1",
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
            <div className="hidden min-w-0 lg:flex lg:flex-1 lg:justify-center lg:px-2">
              <form
                action="/"
                method="get"
                className={[
                  "flex w-full max-w-xs items-center gap-2 rounded-full border px-2.5 py-1 backdrop-blur lg:max-w-md xl:max-w-lg",
                  hasImageBackground
                    ? "border-white/20 bg-black/25"
                    : "border-black/10 bg-white/70",
                ].join(" ")}
              >
                <span
                  className={[
                    "shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] lg:text-xs",
                    hasImageBackground ? "text-white/85" : "text-neutral-600",
                  ].join(" ")}
                >
                  Search
                </span>
                <input
                  type="search"
                  name="q"
                  placeholder="products…"
                  className={[
                    "min-w-0 flex-1 bg-transparent text-[11px] outline-none lg:text-sm",
                    hasImageBackground
                      ? "text-white placeholder:text-white/55"
                      : "text-neutral-900 placeholder:text-neutral-500",
                  ].join(" ")}
                />
              </form>
            </div>
            {(navigation?.some(isShopItem) || navigation?.some(isCartItem) || (loginText && loginHref)) ? (
              <div className="hidden lg:flex lg:flex-1 lg:justify-end">
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
                  href={
                    authReady && authEmail
                      ? isAdmin
                        ? "/creator"
                        : "/sign-in"
                      : loginHref
                  }
                  className={`text-[11px] font-bold tracking-[0.12em] uppercase lg:text-xs xl:text-sm ${navTextClass}`}
                >
                  {authReady && authEmail ? "Account" : loginText}
                </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </nav>
          <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            {mobileMenuOpen ? (
              <DialogContent className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-card px-4 py-4 data-[state=open]:slide-in-from-right sm:left-auto sm:top-0 sm:max-w-sm sm:rounded-none sm:border-l sm:border-border sm:px-6 sm:py-6 sm:ring-1 sm:ring-border lg:hidden [&>button]:hidden">
                <DialogTitle className="sr-only">Menu</DialogTitle>
                <div className="flex items-center justify-between">
                  <a href="/" className="-m-1.5 p-1.5">
                    <span className="sr-only">{logo?.companyName}</span>
                    <img alt={logo?.alt} src={logo?.src} className="h-14 w-auto sm:h-20 md:h-24" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-m-2.5 rounded-md p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="sr-only">Close menu</span>
                    <X aria-hidden="true" className="size-6" />
                  </button>
                </div>
                <div className="mt-2 flow-root">
                  <div className="-my-6 divide-y divide-border">
                    <div className="py-6">
                      <form
                        action="/"
                        method="get"
                        className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2"
                      >
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                          Search
                        </span>
                        <input
                          type="search"
                          name="q"
                          placeholder="products…"
                          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 outline-none"
                        />
                      </form>
                    </div>
                    {navigation && navigation.length > 0 && (
                      <div className="space-y-2 py-6">
                        {navigation.map((item) =>
                          item.items && item.items.length > 0 ? (
                            <div key={item.name} className="-mx-3">
                              <div className="px-3 py-2 text-base/7 font-semibold text-card-foreground">
                                {item.name}
                              </div>
                              <div className="ml-3 space-y-1 border-l border-border pl-3">
                                {item.items.map((sub) => (
                                  <a
                                    key={`${item.name}-${sub.name}`}
                                    href={sub.href}
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
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
                              className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                              aria-label={item.name}
                            >
                              {isShopItem(item) ? (
                                <>
                                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Shop</span>
                                </>
                              ) : isCartItem(item) ? (
                                <>
                                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Cart</span>
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
                          href={
                            authReady && authEmail
                              ? isAdmin
                                ? "/creator"
                                : "/sign-in"
                              : loginHref
                          }
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {authReady && authEmail ? "Account" : loginText}
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
            <div className="hidden sm:mb-6 sm:flex sm:justify-center">
              <div
                className={[
                  "relative rounded-full px-3 py-1.5 text-xs sm:text-sm/6",
                  "ring-1",
                  hasImageBackground
                    ? "text-white/85 ring-white/20 bg-black/25 hover:bg-black/30"
                    : "text-muted-foreground ring-border bg-background/60 hover:bg-background/80",
                  "transition-colors",
                ].join(" ")}
              >
                {announcementBanner.text}{" "}
                <a
                  href={announcementBanner.linkHref}
                  className={hasImageBackground ? "font-semibold text-white hover:text-white/90" : "font-semibold text-primary hover:text-primary/80"}
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
            <h1
              className={[
                getTitleSizeClasses(),
                "font-bold tracking-[-0.02em] text-balance",
                hasImageBackground ? "drop-shadow-[0_10px_32px_rgba(0,0,0,0.35)]" : "",
                titleTextClass,
              ].join(" ")}
              aria-label={title}
            >
              {typedTitle === null ? title : typedTitle}
              {!titleTypingDone && !prefersReducedMotion && typedTitle !== null ? (
                <span
                  className={[
                    "ml-0.5 inline-block w-[2px] animate-pulse align-baseline sm:w-[3px]",
                    hasImageBackground ? "bg-white/90" : "bg-foreground/80",
                  ].join(" ")}
                  style={{ height: "0.85em" }}
                  aria-hidden
                />
              ) : null}
            </h1>
            <p
              className={[
                "mt-5 sm:mt-7 mx-auto max-w-2xl",
                "text-base sm:text-lg font-semibold text-pretty sm:text-xl/8 lg:text-2xl/9 xl:text-2xl/9",
                hasImageBackground ? "drop-shadow-[0_8px_22px_rgba(0,0,0,0.35)]" : "",
                descTextClass,
              ].join(" ")}
            >
              {description}
            </p>

            {callToActions && callToActions.length > 0 && (
              <div className="mt-8 sm:mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6 flex-wrap gap-y-4">
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
