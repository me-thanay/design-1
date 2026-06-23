"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

interface FooterProps {
  contactInfo: {
    title: string;
    address: string;
    email: string;
    phone: string;
  };
  columns: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  copyright: string;
}

export function Footer({
  contactInfo,
  columns,
  socialLinks,
  copyright,
}: FooterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <footer className="surface-texture border-t border-black/5 bg-white pb-12 pt-16 lg:pb-16 lg:pt-20">
      <ScrollReveal variant="blur" y={20} className="block">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Column 1: Contact Information */}
            <div>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-neutral-900">
                {contactInfo.title}
              </h3>
              <div className="space-y-4 text-sm text-neutral-600">
                <p className="leading-relaxed">
                  {contactInfo.address}
                </p>
                <p>
                  <span>Email : </span>
                  <a href={`mailto:${contactInfo.email}`} className="transition-colors hover:text-neutral-900 hover:underline underline-offset-4">
                    {contactInfo.email}
                  </a>
                </p>
                <p>
                  <span>Contact No : </span>
                  <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} className="transition-colors hover:text-neutral-900 hover:underline underline-offset-4">
                    {contactInfo.phone}
                  </a>
                </p>
              </div>
            </div>

            {/* Columns 2-4: Links */}
            {columns.map((col, idx) => (
              <div key={idx}>
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  {col.title}
                </h3>
                <ul className="space-y-4 text-sm text-neutral-600">
                  {col.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href={link.href} className="transition-colors hover:text-neutral-900 hover:underline underline-offset-4">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-black/10 pt-8 md:flex-row">
            <p className="text-sm text-neutral-500 text-center md:text-left">
              {copyright}
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="text-neutral-800 transition-colors hover:text-black"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
