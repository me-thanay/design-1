import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CartProviderClient } from "@/components/cart/CartProviderClient";
import { SITE_LOGO_SRC } from "@/lib/site-logo";

/**
 * Editorial serif for all primary headings (Hero h1, section titles).
 * Playfair Display is a high-contrast Display serif — feels luxury/fashion.
 */
const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

/**
 * Clean geometric sans for navigation, body copy, buttons, and subtext.
 * Montserrat is crisp, modern, and pairs beautifully with Playfair Display.
 */
const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sawbhagya | Premium Ethnic Wear",
  description:
    "Handcrafted blouses, sarees, and combos — premium fabrics, timeless silhouettes, made for every moment.",
  icons: {
    icon: SITE_LOGO_SRC,
    apple: SITE_LOGO_SRC,
  },
};

import { GlobalFooter } from "@/components/ui/global-footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-dvh surface-texture font-sans-explicit">
        <CartProviderClient>{children}</CartProviderClient>
        <GlobalFooter />
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
