"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import type { CartItem } from "./CartProvider";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { publicAssetUrl } from "@/lib/utils";

export interface SoftSignInModalProps {
  open: boolean;
  item: CartItem | null;
  onContinueAsGuest: () => void;
  onClose: () => void;
}

export function SoftSignInModal({
  open,
  item,
  onContinueAsGuest,
  onClose,
}: SoftSignInModalProps) {
  const [loadingGoogle, setLoadingGoogle] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!supabaseEnabled) {
      // If Supabase is disabled locally, gracefully fall back to guest
      onContinueAsGuest();
      return;
    }

    try {
      setLoadingGoogle(true);
      if (item && typeof window !== "undefined") {
        window.localStorage.setItem("sawbhagya.pending.cart_add", JSON.stringify(item));
      }

      const redirectTo = window.location.href;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setLoadingGoogle(false);
      setError(err?.message || "Failed to initiate Google sign in. You can continue as guest.");
    }
  };

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
          onClick={onContinueAsGuest}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#e8dfd3] bg-[#fdfcf9] p-6 sm:p-8 shadow-2xl text-neutral-900"
          >
            {/* Soft Ambient Background Highlight */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#f5ebd9] blur-3xl" />

            {/* Close / Dismiss Button */}
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition"
              aria-label="Close and continue as guest"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header / Brand */}
            <div className="text-center">
              <div className="mx-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-900/15 bg-amber-50/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                <span>Save Your Shopping Bag</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl font-bold tracking-tight text-neutral-900">
                Welcome to Sawbhagya
              </h3>
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                Sign in with Google to reserve your handcrafted pieces, track delivery status, and save your bag across all devices.
              </p>
            </div>

            {/* Product Snapshot Card */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/90 p-3 shadow-sm ring-1 ring-black/[0.03]">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={publicAssetUrl(item.image)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-neutral-900">{item.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-500">
                  {item.color ? <span>Color: {item.color}</span> : null}
                  {item.size ? <span>· Size: {item.size}</span> : null}
                </div>
                <p className="mt-0.5 text-xs font-semibold text-amber-900">
                  ₹{Math.round(item.price * (item.qty || 1)).toLocaleString("en-IN")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                In Stock
              </span>
            </div>

            {/* Error Message */}
            {error ? (
              <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 text-center">
                {error}
              </div>
            ) : null}

            {/* CTAs */}
            <div className="mt-6 space-y-2.5">
              {/* 1-Click Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                className="group relative flex w-full items-center justify-center gap-3 rounded-full bg-neutral-900 py-3 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-75"
              >
                {loadingGoogle ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Connecting Google...
                  </span>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                    <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition" />
                  </>
                )}
              </button>

              {/* Continue as Guest Button */}
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full rounded-full border border-black/10 bg-white/80 py-2.5 px-4 text-xs font-semibold text-neutral-700 hover:bg-white hover:text-neutral-900 transition active:scale-[0.99]"
              >
                Continue as Guest
              </button>
            </div>

            {/* Subtle Assurance */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Secure • No passwords required</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
