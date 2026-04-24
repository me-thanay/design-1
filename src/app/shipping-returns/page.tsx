import { PageShell } from "@/components/ui/page-shell";

const POLICY_POINTS: string[] = [
  "We offer a 48-hour exchange facility on all Domestic orders.",
  "If you wish to exchange the product you have received, please write to us on info@sawbhagya.com, along with your Order ID, within 48 hours of delivery to request an exchange. We won't be able to process an exchange request raised beyond the stipulated time.",
  "Once acknowledged by our team, please send the product back to us yourself. Only products which are unused, unworn, unwashed, undamaged, and in original packaging are eligible for exchange. Please keep the original shipping label that was received by you at the time of delivery and include it while packing the parcel.",
  "The cost of return shipping is at the customer's expense and is non-refundable. We recommend returning items through traceable mail. We will not be responsible for any lost shipment.",
  "Once the product is received by us and a quality check is done by our team, we will issue a one time use Coupon. Kindly redeem this coupon in one go, while placing your exchange order.",
  "A convenience fee of Rs 200 per product (depending on the number of products to be exchanged) will be deducted while issuing the Coupon.",
  "Fall Pico charges are non refundable and will not be added to the value of Coupon.",
  "The Coupon can be used within 1 month from the date of issuing the same.",
  "Products priced at more than Rs 10,000 are not eligible for exchange.",
  "If you have received a damaged or defective product, please mail us at info@sawbhagya.com within 2 days of delivery, to request an exchange along with your Order ID and a snapshot of the defect.",
  "Please note – to claim any damage or defect, a clear video of unpacking the parcel is a must. In absence of the same, we will not be liable to exchange the product.",
  "Once acknowledged by our team, please send the product back to us through a reliable and traceable courier service. The cost of return shipping is at the customer's expense and is non-refundable.",
  "Once we have received the products, a quality check would be done by our team.",
  "A fresh piece will be shipped to you within 2 weeks from the date of receipt of the product by us.",
  "We DO NOT have a refund policy.",
];

export default function ShippingReturnsPage() {
  return (
    <PageShell
      eyebrow="Policy"
      title="Shipping, Returns & Exchange"
      subtitle="Please read the policy below before requesting an exchange."
      contentClassName="pt-10"
    >
      <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
          Returns / Exchange Policy
        </h2>

        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-neutral-700 sm:text-base">
          {POLICY_POINTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>

        <p className="mt-6 text-sm font-medium text-neutral-800 sm:text-base">
          Return/Exchange is not possible for international orders.
        </p>
      </section>
    </PageShell>
  );
}

