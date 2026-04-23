"use client";

import * as React from "react";

type FloatingWhatsAppProps = {
  phoneE164?: string;
  defaultMessage?: string;
};

function WhatsAppMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12.04 2C6.56 2 2.12 6.44 2.12 11.92c0 1.94.57 3.83 1.65 5.45L2 22l4.78-1.74a9.84 9.84 0 0 0 5.26 1.5h.01c5.48 0 9.92-4.44 9.92-9.92C21.97 6.44 17.53 2 12.04 2Zm5.78 14.31c-.24.68-1.19 1.25-1.92 1.4-.5.1-1.13.18-3.67-.77-3.24-1.2-5.33-4.15-5.49-4.37-.16-.22-1.32-1.75-1.32-3.34 0-1.58.83-2.36 1.12-2.68.29-.32.63-.4.84-.4.2 0 .42 0 .6.01.2.01.47-.08.74.56.27.64.9 2.2.98 2.36.08.16.13.35.02.57-.11.22-.16.35-.32.54-.16.19-.34.43-.48.58-.16.16-.33.34-.14.66.2.32.88 1.45 1.89 2.35 1.3 1.15 2.4 1.5 2.72 1.67.32.16.5.14.69-.08.19-.22.79-.92 1-1.24.21-.32.42-.27.7-.16.29.11 1.84.87 2.16 1.03.32.16.53.24.61.37.08.13.08.74-.16 1.42Z"
      />
    </svg>
  );
}

export function FloatingWhatsApp({
  phoneE164 = "918978237992",
  defaultMessage = "Hi Sawbhagya, I want to know more about your products.",
}: FloatingWhatsAppProps) {
  const href = React.useMemo(() => {
    const msg = encodeURIComponent(defaultMessage);
    return `https://wa.me/${phoneE164}?text=${msg}`;
  }, [defaultMessage, phoneE164]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className={[
        "fixed bottom-5 right-5 z-[60] inline-flex items-center justify-center",
        "h-14 w-14 rounded-full",
        "bg-[#25D366] text-white shadow-lg ring-1 ring-black/10",
        "transition-transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/35",
      ].join(" ")}
    >
      <WhatsAppMark className="h-7 w-7" />
    </a>
  );
}

