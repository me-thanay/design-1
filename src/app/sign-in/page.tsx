"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { PageShell } from "@/components/ui/page-shell";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export default function SignInPage() {
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const router = useRouter();

  const to = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("to")?.toLowerCase() ?? null;
  }, []);

  const allowedAdmins = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_CREATOR_EMAIL ?? "";
    return raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  // IMPORTANT: do NOT auto-redirect away from /sign-in when a session exists.
  // Otherwise users see a flash of /sign-in then immediately bounce to home.
  useEffect(() => {
    if (!supabaseEnabled) return;

    const checkLoggedIn = async () => {
      setChecking(true);
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        setCurrentEmail(user?.email ?? null);
      } catch {
        setCurrentEmail(null);
      } finally {
        setChecking(false);
      }
    };

    checkLoggedIn();
  }, []);

  const isAdminEmail = !!currentEmail && allowedAdmins.includes(currentEmail.toLowerCase());

  const goNext = () => {
    if (to === "creator") {
      router.replace("/creator");
      return;
    }
    if (to === "cart") {
      router.replace("/cart");
      return;
    }
    router.replace("/");
  };

  const handleSignOut = async () => {
    try {
      if (supabaseEnabled) {
        await supabase.auth.signOut();
      }
    } finally {
      setCurrentEmail(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);

    if (!supabaseEnabled) {
      setError("Google login requires Supabase to be enabled.");
      return;
    }

    try {
      setLoading(true);
      // IMPORTANT for PKCE:
      // The OAuth flow MUST start and finish on the same origin,
      // otherwise the PKCE code_verifier stored in web storage won't be found.
      const baseNoSlash = window.location.origin.replace(/\/$/, "");
      const to = new URLSearchParams(window.location.search).get("to")?.toLowerCase();
      // Supabase OAuth (PKCE) returns a `code` that must be exchanged for a session.
      // We do that on /auth/callback and then route based on `?to=...`.
      const redirectTo = `${baseNoSlash}/auth/callback${to ? `?to=${encodeURIComponent(to)}` : ""}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      const msg =
        typeof err?.message === "string"
          ? err.message
          : err
            ? JSON.stringify(err)
            : "Google sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Sign in"
      subtitle={
        to === "creator"
          ? "Sign in with an admin account to access the creator dashboard."
          : to === "cart"
            ? "Sign in to checkout your cart."
            : "Sign in with Google to continue."
      }
      contentClassName="pt-10"
    >
      <div className="mx-auto w-full max-w-lg">
        <ScrollReveal variant="scale" y={20}>
        <motion.div
          className="overflow-hidden rounded-3xl border border-black/10 bg-white/60 shadow-sm ring-1 ring-black/[0.03] backdrop-blur"
          whileHover={reduceMotion ? undefined : { boxShadow: "0 24px 48px rgba(0,0,0,0.08)" }}
          transition={{ duration: 0.25 }}
        >
          <div className="p-6 sm:p-8">
            {!supabaseEnabled ? (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Supabase is currently disabled. Google sign-in will not work until it
                is configured.
              </div>
            ) : null}

            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {checking ? (
              <div className="rounded-2xl border border-black/10 bg-white/60 p-4 text-sm text-neutral-700">
                Checking session…
              </div>
            ) : currentEmail ? (
              <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  Signed in as{" "}
                  <span className="font-semibold text-amber-800">{currentEmail}</span>
                </p>
                {to === "creator" && !isAdminEmail ? (
                  <p className="mt-2 text-xs text-red-700">
                    This account is not an admin. Please sign out and use an admin
                    email.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-neutral-600">
                    Continue to{" "}
                    {to === "creator"
                      ? "Creator dashboard"
                      : to === "cart"
                        ? "Cart"
                        : "Home"}
                    .
                  </p>
                )}

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (to === "creator" && !isAdminEmail) return;
                      goNext();
                    }}
                    disabled={to === "creator" && !isAdminEmail}
                    className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-white"
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  >
                    Sign out
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
                <p className="text-sm font-medium text-neutral-900">
                  Continue with Google
                </p>
                <p className="mt-1 text-xs text-neutral-600">
                  We’ll use your Google account to create a secure session.
                </p>
              </div>
            )}

            <motion.button
              type="button"
              disabled={loading || checking || !!currentEmail}
              onClick={handleGoogleSignIn}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={loading || checking || !!currentEmail || reduceMotion ? undefined : { y: -2, scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <span>{loading ? "Please wait..." : "Continue with Google"}</span>
            </motion.button>

            <p className="mt-4 text-center text-[11px] text-neutral-500">
              By continuing, you agree to our{" "}
              <a className="underline underline-offset-4" href="#">
                Terms
              </a>{" "}
              and{" "}
              <a className="underline underline-offset-4" href="#">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.div>
        </ScrollReveal>
      </div>
    </PageShell>
  );
}

