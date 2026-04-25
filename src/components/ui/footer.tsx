"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { buttonVariants } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    mapsHref?: string;
    whatsappHref?: string;
  };
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
}

export function Footer({
  logo,
  brandName,
  contact,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <footer className="surface-texture pb-6 pt-16 lg:pb-8 lg:pt-24">
      <ScrollReveal variant="blur" y={20} className="block">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="md:flex md:items-start md:justify-between">
            <motion.a
              href="/"
              className="flex items-center gap-x-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              aria-label={brandName}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
            >
              {logo}
              <span className="text-xl font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-700">
                {brandName}
              </span>
            </motion.a>
            <ul className="mt-6 flex list-none space-x-3 md:mt-0">
              {socialLinks.map((link, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={i}>
                  <motion.a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "icon" }),
                      "h-10 w-10 rounded-full transition-shadow",
                    )}
                    whileHover={
                      reduceMotion ? undefined : { scale: 1.08, y: -2, boxShadow: "0 12px 28px rgba(0,0,0,0.12)" }
                    }
                    whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                  >
                    {link.icon}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-black/10 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
            <nav className="lg:col-[4/11] lg:mt-0">
              <ul className="flex list-none flex-wrap -mx-2 -my-1 lg:justify-end">
                {mainLinks.map((link, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i} className="mx-2 my-1 shrink-0">
                    <a
                      href={link.href}
                      className="text-sm text-neutral-900 underline-offset-4 transition-colors hover:text-neutral-600 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-6 lg:col-[4/11] lg:mt-0">
              <ul className="flex list-none flex-wrap -mx-3 -my-1 lg:justify-end">
                {legalLinks.map((link, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i} className="mx-3 my-1 shrink-0">
                    <a
                      href={link.href}
                      className="text-sm text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 whitespace-nowrap text-sm leading-6 text-neutral-600 lg:col-[1/4] lg:row-[1/3] lg:mt-0">
              <div>{copyright.text}</div>
              {copyright.license && <div>{copyright.license}</div>}
            </div>

            {contact ? (
              <div className="mt-6 text-sm leading-6 text-neutral-700 lg:col-[1/4] lg:row-[3/4] lg:mt-4">
                <div className="space-y-2">
                  {contact.phone ? (
                    <div className="flex flex-col">
                      <span className="text-neutral-500">Phone</span>
                      <a
                        className="text-neutral-900 underline-offset-4 hover:underline"
                        href={`tel:+91${contact.phone}`}
                      >
                        +91 {contact.phone}
                      </a>
                    </div>
                  ) : null}
                  {contact.email ? (
                    <div className="flex flex-col">
                      <span className="text-neutral-500">Email</span>
                      <a
                        className="text-neutral-900 underline-offset-4 hover:underline break-all"
                        href={`mailto:${contact.email}`}
                      >
                        {contact.email}
                      </a>
                    </div>
                  ) : null}
                  {contact.address ? (
                    <div className="flex flex-col text-neutral-600">
                      <span className="text-neutral-500">Address</span>
                      {contact.mapsHref ? (
                        <a
                          className="underline-offset-4 hover:underline break-words"
                          href={contact.mapsHref}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {contact.address}
                        </a>
                      ) : (
                        <span className="break-words">{contact.address}</span>
                      )}
                    </div>
                  ) : null}
                  {contact.whatsappHref ? (
                    <div>
                      <a
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm transition hover:bg-white"
                        href={contact.whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Message us on WhatsApp
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
