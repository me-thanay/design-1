"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";
import { PRIMARY_NAV } from "@/lib/navigation";

export function FloatingHeader() {
  const reduceMotion = useReducedMotion();
  const { itemCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [openDesktopDropdown, setOpenDesktopDropdown] = React.useState<string | null>(null);
  const [activeDesktopDropdownItem, setActiveDesktopDropdownItem] = React.useState<string | null>(null);

  const navIconClassName = "h-5 w-5 sm:h-[22px] sm:w-[22px] lg:h-6 lg:w-6";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    const target = q ? `/?q=${encodeURIComponent(q)}` : "/#shop";
    window.location.href = target;
  };

  React.useEffect(() => {
    const checkUser = async () => {
      if (!supabaseEnabled) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsLoggedIn(true);
          const fromMeta =
            (user.user_metadata as any)?.full_name ||
            (user.user_metadata as any)?.name;
          const fromEmail = user.email?.split("@")[0] ?? null;
          setUserName(fromMeta || fromEmail || null);
        } else {
          setIsLoggedIn(false);
          setUserName(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUserName(null);
      }
    };

    checkUser();
  }, []);

  React.useEffect(() => {
    if (!openDesktopDropdown) return;

    const navItem = PRIMARY_NAV.find((n) => n.name === openDesktopDropdown);
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

  const handleSignOut = async () => {
    try {
      if (supabaseEnabled) {
        await supabase.auth.signOut();
      }
    } finally {
      setIsLoggedIn(false);
      setUserName(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <header className="w-full">
      <motion.nav
        className="mx-auto mt-2 flex max-w-6xl items-center justify-between gap-2 rounded-full bg-white px-2 py-1 text-xs font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200 md:px-3 md:py-1.5 lg:gap-4 lg:text-sm"
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={
          reduceMotion ? undefined : { boxShadow: "0 18px 40px rgba(0,0,0,0.08)", transition: { duration: 0.25 } }
        }
      >
        <div className="min-w-0 flex shrink-0 items-center gap-2 sm:gap-3 lg:mr-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SITE_LOGO_SRC}
            alt={SITE_LOGO_ALT}
            className="h-14 w-auto shrink-0 object-contain sm:h-16 md:h-[4.5rem] lg:h-24"
          />
        </div>
        <div className="hidden items-center gap-5 lg:flex xl:gap-7">
          {PRIMARY_NAV.filter((x) => x.name !== "Cart").map((item) =>
            item.items && item.items.length > 0 ? (
              <div
                key={item.name}
                className="relative group"
                onPointerEnter={() => setOpenDesktopDropdown(item.name)}
                onPointerLeave={() => setOpenDesktopDropdown((v) => (v === item.name ? null : v))}
              >
                <span
                  className="inline-flex cursor-default items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-800 lg:text-xs xl:text-sm"
                  aria-haspopup="menu"
                  aria-expanded={openDesktopDropdown === item.name}
                >
                  {item.name}
                  <span aria-hidden="true" className="translate-y-[-1px] opacity-70">
                    ▾
                  </span>
                </span>
                <div className="absolute left-0 top-full z-50 pt-2">
                  <div
                    className={[
                      "w-[34rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl",
                      openDesktopDropdown === item.name
                        ? "pointer-events-auto opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 translate-y-1",
                      "transition duration-150",
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
                              "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-zinc-50 text-zinc-900"
                                : "text-zinc-800 hover:bg-zinc-50",
                            ].join(" ")}
                          >
                            {sub.name}
                          </a>
                        );
                      })}
                    </div>
                    <div className="border-l border-zinc-200">
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
                              style={{ filter: "saturate(1.05) contrast(1.05)" }}
                            />
                          );
                        })()}
                        <div className="mt-2 text-xs text-zinc-500">{item.name}</div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={item.name}
                href={item.href}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-800 hover:text-zinc-900 transition-colors lg:text-xs xl:text-sm"
                aria-label={item.name}
              >
                {item.name === "Shop" ? (
                  <>
                    <ShoppingBag className={navIconClassName} aria-hidden="true" />
                    <span className="sr-only">Shop</span>
                  </>
                ) : (
                  item.name
                )}
              </a>
            ),
          )}
        </div>
        <form
          onSubmit={submitSearch}
          className="mx-3 hidden flex-1 items-center gap-2 lg:flex"
        >
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search sarees by name or keyword..."
            className="w-full rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs text-zinc-700 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400"
          />
          <motion.button
            type="submit"
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-zinc-800 hover:bg-zinc-100 lg:text-sm"
            whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            Search
          </motion.button>
        </form>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <motion.a
            href={isLoggedIn ? "/cart" : "/sign-in"}
            className="relative inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-800 hover:text-zinc-900 sm:px-3 lg:text-sm"
            whileHover={reduceMotion ? undefined : { y: -1 }}
            aria-label="Cart"
          >
            <ShoppingCart className={navIconClassName} aria-hidden="true" />
            <span className="sr-only">Cart</span>
            {itemCount > 0 ? (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </motion.a>
          {!isLoggedIn ? (
            <motion.a
              href="/sign-in"
              className="hidden rounded-full border border-zinc-300 bg-transparent px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-900 hover:bg-zinc-100 md:inline-flex lg:text-sm"
              whileHover={reduceMotion ? undefined : { scale: 1.03, y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Login
            </motion.a>
          ) : (
            <div className="hidden items-center gap-2 text-xs md:flex lg:text-sm">
              <span className="max-w-[140px] truncate rounded-full bg-zinc-100 px-3 py-1 font-semibold uppercase tracking-[0.1em] text-zinc-700">
                Welcome {userName ?? ""}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-zinc-300 bg-transparent px-3 py-1 font-semibold uppercase tracking-[0.12em] text-zinc-900 hover:bg-zinc-100"
              >
                Sign out
              </button>
            </div>
          )}
          {/* Mobile menu button */}
          <motion.button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-[16px] text-zinc-800 lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          >
            <span className="leading-none">☰</span>
          </motion.button>
        </div>
      </motion.nav>
      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="mx-auto mt-2 w-full max-w-6xl origin-top rounded-2xl bg-white px-4 py-3 text-[11px] font-medium text-zinc-800 shadow-sm ring-1 ring-zinc-200 lg:hidden"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
          <nav className="flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                submitSearch(e);
                setMenuOpen(false);
              }}
              className="mb-1 flex items-center gap-2"
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search items..."
                className="w-full rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 outline-none placeholder:text-zinc-400 focus:border-zinc-400"
              />
              <button
                type="submit"
                className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-800"
              >
                Go
              </button>
            </form>
            <a
              href={isLoggedIn ? "/cart" : "/sign-in"}
              className="mt-1 rounded-full px-3 py-1.5 uppercase tracking-[0.16em] text-zinc-700 hover:bg-zinc-100"
              onClick={() => setMenuOpen(false)}
            >
              {isLoggedIn ? "Cart" : "Login to view cart"}
            </a>
            <div className="mt-2 space-y-1 border-t border-zinc-200 pt-3">
              {PRIMARY_NAV.filter((x) => x.name !== "Cart").map((item) =>
                item.items && item.items.length > 0 ? (
                  <div key={item.name} className="space-y-1">
                    <a
                      href={item.href}
                      className="block rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-800 hover:bg-zinc-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                    <div className="ml-3 space-y-1 border-l border-zinc-200 pl-3">
                      {item.items.map((sub) => (
                        <a
                          key={`${item.name}-${sub.name}`}
                          href={sub.href}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                          onClick={() => setMenuOpen(false)}
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
                    className="block rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-800 hover:bg-zinc-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ),
              )}
            </div>
          </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

