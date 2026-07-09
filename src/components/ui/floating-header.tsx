"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, ShoppingBag, ShoppingCart, X, ChevronDown } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";
import { PRIMARY_NAV } from "@/lib/navigation";

export function FloatingHeader() {
  const reduceMotion = useReducedMotion();
  const { itemCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = React.useState<string | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [openDesktopDropdown, setOpenDesktopDropdown] = React.useState<string | null>(null);
  const [activeDesktopDropdownItem, setActiveDesktopDropdownItem] = React.useState<string | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
  const accountDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!accountDropdownOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [accountDropdownOpen]);

  const navIconClassName = "h-[18px] w-[18px] sm:h-5 sm:w-5 lg:h-[22px] lg:w-[22px]";

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
          setUserEmail(user.email ?? null);
          const meta = (user.user_metadata as any) ?? {};
          setUserAvatarUrl((meta.avatar_url ?? meta.picture ?? meta.avatar ?? null) as string | null);
          const fromMeta =
            (user.user_metadata as any)?.full_name ||
            (user.user_metadata as any)?.name;
          const fromEmail = user.email?.split("@")[0] ?? null;
          setUserName(fromMeta || fromEmail || null);
        } else {
          setIsLoggedIn(false);
          setUserName(null);
          setUserEmail(null);
          setUserAvatarUrl(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUserName(null);
        setUserEmail(null);
        setUserAvatarUrl(null);
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
        className="w-full grid min-h-0 grid-cols-[40px_1fr_40px] items-center gap-2 bg-white/95 backdrop-blur px-2 py-1 text-xs font-medium text-zinc-900 shadow-sm border-b border-zinc-200 sm:px-4 sm:py-1.5 lg:flex lg:justify-between lg:gap-6 lg:px-8 lg:text-sm"
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={
          reduceMotion ? undefined : { boxShadow: "0 18px 40px rgba(0,0,0,0.08)", transition: { duration: 0.25 } }
        }
      >
        {/* Mobile: left menu button (keeps logo perfectly centered) */}
        <div className="flex items-center justify-start lg:hidden">
          <motion.button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-white text-[16px] text-zinc-800"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          >
            <span className="leading-none">☰</span>
          </motion.button>
        </div>

        <div className="min-w-0 flex lg:flex-1 shrink-0 items-center justify-center gap-2 sm:gap-3 lg:justify-start">
          <Link
            href="/"
            className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            aria-label="Go to home"
            onClick={() => setMenuOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_LOGO_SRC}
              alt={SITE_LOGO_ALT}
              className="h-10 w-auto shrink-0 object-contain sm:h-14 sm:-my-1 md:h-[3.5rem] md:-my-2 lg:h-20 lg:-my-2.5"
            />
          </Link>
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
                <a
                  href={item.href}
                  className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-800 hover:text-zinc-900 transition-colors lg:text-xs xl:text-sm"
                  aria-haspopup="menu"
                  aria-expanded={openDesktopDropdown === item.name}
                >
                  {item.name}
                  <span aria-hidden="true" className="translate-y-[-1px] opacity-70">
                    ▾
                  </span>
                </a>
                <div className={`absolute left-0 top-full z-50 pt-2 ${openDesktopDropdown === item.name ? "" : "pointer-events-none"}`}>
                  <div
                    className={[
                      "w-[34rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl",
                      openDesktopDropdown === item.name
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1",
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
                              className={[
                                "h-40 w-full rounded-xl",
                                item.href.includes("/coord_sets")
                                  ? "object-contain bg-neutral-100"
                                  : "object-cover",
                              ].join(" ")}
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
        <div className="flex items-center justify-end lg:flex-1 lg:gap-4">
          <NavSearchBar navIconClassName={navIconClassName} />
          <motion.a
            href={isLoggedIn ? "/cart" : "/sign-in"}
            className="relative inline-flex items-center gap-2 rounded-full px-1.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-800 hover:text-zinc-900 sm:px-2 lg:px-3 lg:text-sm"
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
            <div className="relative hidden items-center gap-2 text-xs md:flex lg:text-sm" ref={accountDropdownRef}>
              <button
                type="button"
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-2.5 py-1 ring-1 ring-black/5 hover:bg-zinc-100 transition-colors duration-150 outline-none focus-visible:ring-black/20"
                aria-haspopup="menu"
                aria-expanded={accountDropdownOpen}
              >
                <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[11px] font-bold text-zinc-700">
                      {(userEmail?.[0] ?? userName?.[0] ?? "U").toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-zinc-800">
                  Your Account
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 transition-transform duration-150" style={{ transform: accountDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              <AnimatePresence>
                {accountDropdownOpen && (
                  <motion.div
                    className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    role="menu"
                  >
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-1 truncate">
                      {userEmail}
                    </div>
                    <Link
                      href="/orders"
                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors w-full text-left"
                      onClick={() => setAccountDropdownOpen(false)}
                      role="menuitem"
                    >
                      Your Orders
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="block rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/50 transition-colors w-full text-left"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
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
            {isLoggedIn && (
              <div className="flex flex-col gap-3 px-3 py-3 border-b border-zinc-100 mb-1">
                <div className="flex items-center gap-3">
                  <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-100 ring-1 ring-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {userAvatarUrl ? (
                      <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold text-zinc-700">
                        {(userEmail?.[0] ?? userName?.[0] ?? "U").toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-zinc-800">Your Account</p>
                    <p className="truncate text-[10.5px] text-zinc-500">{userEmail}</p>
                  </div>
                </div>
                <div className="flex gap-2.5 mt-1">
                  <Link
                    href="/orders"
                    className="flex-1 text-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Your Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                    className="flex-1 text-center rounded-lg border border-red-200 bg-red-50/20 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/55 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
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


/** ──────────────────────────────────────────────────────────────────────────
 * NavSearchBar
 * Collapsed: a single Search icon balanced with Bag/Cart icons.
 * Expanded: minimal input with a 1px bottom border — no background fill.
 * ─────────────────────────────────────────────────────────────────────────── */
function NavSearchBar({ navIconClassName }: { navIconClassName: string }) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="hidden lg:flex items-center">
      <div className="relative flex items-center justify-end">
        <form
          action="/"
          method="get"
          className={[
            "flex items-center overflow-hidden transition-all duration-300 ease-out mr-1",
            open ? "w-60 opacity-100" : "w-0 opacity-0 pointer-events-none",
          ].join(" ")}
          onSubmit={() => setOpen(false)}
        >
          <div className="flex w-full items-center gap-1.5 border-b border-zinc-400 pb-0.5">
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Search sarees, blouses…"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-xs text-zinc-800 outline-none placeholder:font-light placeholder:text-zinc-400 lg:text-sm"
              style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
            />
          </div>
        </form>

        <button
          type="button"
          aria-label={open ? "Close search" : "Open search"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center text-zinc-800 transition-colors hover:text-zinc-900"
        >
          {open ? (
            <X className={navIconClassName} strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Search className={navIconClassName} strokeWidth={2.5} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
