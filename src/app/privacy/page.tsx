import { PageShell } from "@/components/ui/page-shell";

export const metadata = {
  title: "Privacy Policy | Sawbhagya",
  description: "Privacy policy and data handling practices for Sawbhagya.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your data."
      contentClassName="pt-10"
    >
      <section className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm sm:p-8">
        <div className="space-y-6 text-sm leading-relaxed text-neutral-700 sm:text-base">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">1. Information We Collect</h2>
            <p>
              When you visit Sawbhagya, we may collect personal information such as your name, email address, phone number, shipping address, and payment details when you place an order or contact us. We also collect anonymous browsing data to improve our site experience.
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">2. How We Use Your Information</h2>
            <p>
              We use your information to process transactions, deliver orders, communicate with you regarding your purchases, provide customer support, and send occasional promotional emails if you have opted in.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">3. Data Protection</h2>
            <p>
              Your personal data is protected using standard security protocols. We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information, except for trusted third parties who assist us in operating our website and fulfilling your orders (e.g., courier partners, payment gateways).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">4. Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience, analyze site traffic, and understand customer preferences. You can choose to disable cookies through your browser settings, though this may affect the functionality of certain site features.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">5. Changes to this Policy</h2>
            <p>
              Sawbhagya reserves the right to update or modify this Privacy Policy at any time without prior notice. Any changes will be reflected on this page.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Contact Us</h2>
            <p>
              If you have any questions regarding this privacy policy, please contact us at info@sawbhagya.com or reach out via our Contact Us page.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
