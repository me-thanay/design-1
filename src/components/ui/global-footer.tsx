import * as React from "react";
import { Footer } from "@/components/ui/footer";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

export function GlobalFooter() {
  return (
    <Footer
      contactInfo={{
        title: "CONTACT INFORMATION",
        address: "Sri Sai Anjaneya Residency- 1st Floor , Sri Sai Balaji Enclave Main Road, Mallampet, Hyderabad, Telangana 500090",
        email: "info@sawbhagya.com",
        phone: "+91 8978237992",
      }}
      columns={[
        {
          title: "INFORMATION",
          links: [
            { label: "About Us", href: "/#about" },
            { label: "Contact Us", href: "/contact" },
            { label: "Blog", href: "/blog" },
          ],
        },
        {
          title: "POLICY",
          links: [
            { label: "Privacy Policy", href: "#" },
            { label: "Shipping & Delivery", href: "/shipping-returns" },
            { label: "Return Policy", href: "/shipping-returns" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "FAQ", href: "#" },
          ],
        },
        {
          title: "CATEGORY",
          links: [
            { label: "Sarees", href: "/categories/sarees" },
            { label: "Kurtis", href: "/categories/kurtis" },
            { label: "Blouses", href: "/categories/blouses" },
            { label: "Gowns", href: "/categories/gowns" },
            { label: "Coord Set", href: "/categories/coord_sets" },
          ],
        },
      ]}
      socialLinks={[
        {
          icon: <FacebookIcon className="h-5 w-5" />,
          href: "https://facebook.com",
          label: "Facebook",
        },
        {
          icon: <InstagramIcon className="h-5 w-5" />,
          href: "https://instagram.com",
          label: "Instagram",
        },
        {
          icon: <YoutubeIcon className="h-5 w-5" />,
          href: "https://youtube.com",
          label: "YouTube",
        },
      ]}
      copyright={`Copyright © ${new Date().getFullYear()} Sawbhagya all rights reserved.`}
    />
  );
}
