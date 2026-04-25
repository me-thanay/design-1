import { PageShell } from "@/components/ui/page-shell";

const SUPPORT_EMAIL = "info@sawbhagya.com";
const SUPPORT_PHONE = "+91 8978237992";
const SUPPORT_WHATSAPP_E164 = "918978237992";

const SHOP_ADDRESS_LINES = [
  "Sri Sai Anjaneya Residency – 1st Floor",
  "Sri Sai Balaji Enclave Main Road, Mallampet",
  "Hyderabad, Telangana 500090",
] as const;

const HOW_TO_REQUEST_STEPS = [
  "Share the unboxing video along with your Order ID and a brief description of the issue on WhatsApp or email.",
  "Once approved, ship the product back to us in its original condition and packaging, including hangers, tags, poly bags, and boxes.",
  "Share the courier receipt with us on WhatsApp for tracking purposes.",
] as const;

const IMPORTANT_GUIDELINES = [
  "Product must be unused, unwashed, unworn, and undamaged.",
  "We will not accept returns for size issues, change of mind, or color variations.",
  "We make unboxing videos of all returned products to verify their condition. Returns found to be used or tampered with will be rejected.",
  "Exchange is allowed for one item at a time only. For multiple items, separate requests must be made.",
  "Exchange requests must be raised within 48 hours of delivery with Order ID.",
  "Return pickup service is not available. Customers must self-ship the item to us.",
  "A convenience fee of Rs 200 per product may be deducted while issuing the exchange coupon.",
  "Fall Pico charges are non refundable and will not be added to the value of coupon.",
  "Products priced at more than Rs 10,000 are not eligible for exchange.",
] as const;

export default function ShippingReturnsPage() {
  const whatsappHref =
    `https://wa.me/${SUPPORT_WHATSAPP_E164}?text=` +
    encodeURIComponent("Hi Sawbhagya, I want to request a return/exchange. My Order ID is ...");

  return (
    <PageShell
      eyebrow="Policy"
      title="Shipping, Returns & Exchange"
      subtitle="Everything you need to request an exchange/return — steps, address, and guidelines."
      contentClassName="pt-10"
    >
      <div className="space-y-10">
        <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            How to request a return or exchange
          </p>
          <ol className="mt-5 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-neutral-700 sm:text-base">
            {HOW_TO_REQUEST_STEPS.map((s) => (
              <li key={s}>
                <span className="font-semibold">Step:</span> {s}
              </li>
            ))}
          </ol>

          <div className="mt-7 rounded-2xl border border-black/10 bg-white/80 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="text-sm text-neutral-800 sm:text-base">
                <span className="font-semibold">Note:</span> Return pickup service is{" "}
                <span className="font-semibold">not available</span>. Customers must{" "}
                <span className="font-semibold">self-ship</span> the item to us.
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800"
                >
                  WhatsApp us
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Self-ship address
          </p>
          <div className="mt-5 rounded-2xl border border-black/10 bg-white/80 p-5 sm:p-6">
            <div className="text-sm font-semibold text-neutral-900 sm:text-base">SAWBHAGYA</div>
            <div className="mt-2 space-y-1 text-sm text-neutral-700 sm:text-base">
              {SHOP_ADDRESS_LINES.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 text-sm text-neutral-700 sm:grid-cols-2 sm:text-base">
              <div>
                <span className="text-neutral-500">Email:</span>{" "}
                <a className="text-neutral-900 underline-offset-4 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <div>
                <span className="text-neutral-500">Phone:</span>{" "}
                <a className="text-neutral-900 underline-offset-4 hover:underline" href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}>
                  {SUPPORT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Important guidelines
          </p>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-neutral-700 sm:text-base">
            {IMPORTANT_GUIDELINES.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Refund process
          </p>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-neutral-700 sm:text-base">
            <li>
              <span className="font-semibold">Refunds are not available.</span> A credit note / exchange coupon will
              be issued once the correct product is received by us.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Cancellation policy
          </p>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-neutral-700 sm:text-base">
            <li>
              <span className="font-semibold">Prepaid orders cannot be cancelled.</span>
            </li>
            <li>
              If you need help urgently, contact us within{" "}
              <span className="font-semibold">24 hours</span> of placing the order:
              <div className="mt-2 space-y-1">
                <div>
                  <span className="text-neutral-500">Email:</span>{" "}
                  <a className="text-neutral-900 underline-offset-4 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                </div>
                <div>
                  <span className="text-neutral-500">Phone:</span>{" "}
                  <a className="text-neutral-900 underline-offset-4 hover:underline" href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}>
                    {SUPPORT_PHONE}
                  </a>
                </div>
              </div>
            </li>
            <li className="text-neutral-600">
              The customer agrees to accept Sawbhagya’s final decision regarding cancellations.
            </li>
          </ul>
          <p className="mt-6 text-sm font-medium text-neutral-800 sm:text-base">
            Return/Exchange is not possible for international orders.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

