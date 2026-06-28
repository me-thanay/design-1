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
  const [hovered, setHovered] = React.useState(false);

  const href = React.useMemo(() => {
    const msg = encodeURIComponent(defaultMessage);
    return `https://wa.me/${phoneE164}?text=${msg}`;
  }, [defaultMessage, phoneE164]);

  return (
    <>
      <style>{`
        @keyframes wa-float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .wa-float-btn {
          animation: wa-float 3s ease-in-out infinite;
        }
        .wa-float-btn:hover {
          animation-play-state: paused;
        }
        .wa-tooltip {
          opacity: 0;
          transform: translateX(8px) scale(0.95);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .wa-wrapper:hover .wa-tooltip {
          opacity: 1;
          transform: translateX(0) scale(1);
          pointer-events: auto;
        }
      `}</style>

      <div
        className="wa-wrapper fixed bottom-6 right-5 z-[9000] flex items-center gap-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Tooltip — appears to the LEFT of the button */}
        <div
          className="wa-tooltip"
          role="tooltip"
        >
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/8 hover:bg-neutral-50 transition-colors"
          >
            {/* green dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#25D366]" />
            </span>
            <div>
              <p className="text-[13px] font-semibold leading-tight text-neutral-900">Contact us</p>
              <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">Chat on WhatsApp</p>
            </div>
            {/* small arrow pointing right */}
            <svg
              className="ml-1 h-3 w-3 text-neutral-300"
              viewBox="0 0 6 10"
              fill="none"
            >
              <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {/* caret on the right edge of tooltip */}
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-white" />
        </div>

        {/* WhatsApp button */}
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
          className={[
            "wa-float-btn",
            "flex h-14 w-14 items-center justify-center rounded-full shrink-0",
            "bg-[#25D366] text-white",
            "shadow-[0_4px_24px_rgba(37,211,102,0.45)]",
            "ring-1 ring-black/10",
            "transition-shadow hover:shadow-[0_6px_32px_rgba(37,211,102,0.6)]",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40",
          ].join(" ")}
        >
          <WhatsAppMark className="h-7 w-7" />
        </a>
      </div>
    </>
  );
}
