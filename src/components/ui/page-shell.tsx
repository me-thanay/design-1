"use client";

import * as React from "react";
import { FloatingHeader } from "@/components/ui/floating-header";
import { Footer } from "@/components/ui/footer";
import { PageTransition } from "@/components/motion/page-transition";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from "@/lib/site-logo";

type PageShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  containerClassName?: string;
  contentClassName?: string;
};

export function PageShell({
  children,
  eyebrow,
  title,
  subtitle,
  containerClassName,
  contentClassName,
}: PageShellProps) {
  return (
    <div className={`surface-texture min-h-screen ${containerClassName ?? ""}`}>
      <div className="pointer-events-none sticky top-0 z-50 flex justify-center px-4 pt-2">
        <div className="pointer-events-auto w-full max-w-6xl">
          <FloatingHeader />
        </div>
      </div>

      <main
        className={`mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:pt-10 ${contentClassName ?? ""}`}
      >
        <PageTransition>
          {(eyebrow || title || subtitle) && (
            <header className="mb-8 space-y-3">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="max-w-2xl text-sm text-neutral-600">{subtitle}</p>
              ) : null}
            </header>
          )}

          {children}
        </PageTransition>
      </main>

    </div>
  );
}

