"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!supabaseEnabled) {
        setError("Supabase is disabled. OAuth cannot complete.");
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const to = (params.get("to") ?? "").toLowerCase();

        // For implicit flow: tokens are in the URL hash. Supabase detects them automatically
        // via detectSessionInUrl. We just need to wait a moment and then check the session.
        const hash = window.location.hash;
        const hasHashTokens = hash.includes("access_token=");

        if (hasHashTokens) {
          // Give Supabase a moment to detect and store the session from the hash
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          // Fallback: PKCE code exchange (legacy)
          const code = params.get("code");
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
          }
        }

        // Check if session now exists
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data?.session;
        if (!hasSession) {
          router.replace(
            to === "creator"
              ? "/sign-in?to=creator"
              : to === "cart"
                ? "/sign-in?to=cart"
                : "/sign-in",
          );
          return;
        }

        router.replace(
          to === "creator" ? "/creator" : to === "cart" ? "/cart" : "/",
        );
      } catch (err: any) {
        setError(typeof err?.message === "string" ? err.message : "Could not complete sign-in.");
      }
    };

    run();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <motion.div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-zinc-200/80"
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-center text-xl font-semibold text-zinc-900">
          Finishing sign-in…
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-600">
          Please wait while we securely connect your account.
        </p>
        {error ? (
          <motion.p
            className="mt-4 text-center text-sm text-red-600"
            role="alert"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        ) : (
          <>
            {!reduceMotion ? (
              <motion.div
                className="mx-auto mt-6 h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200"
                aria-hidden
              >
                <motion.div
                  className="h-full rounded-full bg-zinc-800"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  style={{ width: "40%" }}
                />
              </motion.div>
            ) : null}
            <p className="mt-4 text-center text-xs text-zinc-400">
              If this takes too long, go back and try again.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

