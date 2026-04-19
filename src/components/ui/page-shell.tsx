"use client";

import * as React from "react";
import { FloatingHeader } from "@/components/ui/floating-header";
import { Footer } from "@/components/ui/footer";
import { PageTransition } from "@/components/motion/page-transition";
import { Mail, MapPin, Phone } from "lucide-react";
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

      <Footer
        logo={
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SITE_LOGO_SRC}
            alt={SITE_LOGO_ALT}
            className="h-9 w-9 rounded-sm object-contain"
          />
        }
        brandName="Sawbhagya"
        socialLinks={[
          {
            icon: <Mail className="h-5 w-5" />,
            href: "mailto:hello@sawbhagya.com",
            label: "Email",
          },
          {
            icon: <Phone className="h-5 w-5" />,
            href: "tel:+910000000000",
            label: "Phone",
          },
          { icon: <MapPin className="h-5 w-5" />, href: "/#shop", label: "Shop" },
        ]}
        mainLinks={[
          { href: "/#best-seller", label: "Best sellers" },
          { href: "/#shop", label: "Shop" },
          { href: "/cart", label: "Cart" },
          { href: "/#categories", label: "Categories" },
          { href: "/sign-in?to=creator", label: "Admin" },
        ]}
        legalLinks={[
          { href: "#", label: "Shipping & returns" },
          { href: "#", label: "Privacy" },
          { href: "#", label: "Terms" },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} Sawbhagya`,
          license: "All rights reserved",
        }}
      />
    </div>
  );
}

