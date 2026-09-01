"use client";

import * as React from "react";
import { Mail, Send, CheckCircle2, Clock, ShieldCheck, Sparkles, Loader2, AlertCircle, Eye } from "lucide-react";
import { generateCartReminderHtml, generateCartReminderSubject, type CartReminderStage } from "@/lib/cart-reminder-email";
import type { CartItem } from "@/components/cart/CartProvider";

const SAMPLE_TEST_ITEMS: CartItem[] = [
  {
    id: "sample-1",
    productId: "101",
    name: "Crimson Red Bridal Zari Blouse",
    price: 2499,
    qty: 1,
    color: "Crimson Red",
    size: "38",
    image: "/images/hero1.jpg",
  },
  {
    id: "sample-2",
    productId: "102",
    name: "Handwoven Royal Chanderi Silk Saree",
    price: 4999,
    qty: 1,
    color: "Gold & Emerald",
    size: "Free Size",
    image: "/images/hero2.jpg",
  },
];

const STAGE_OPTIONS: Array<{ stage: CartReminderStage; timing: string; title: string; desc: string }> = [
  {
    stage: 1,
    timing: "3 Hours",
    title: "Stage 1: Gentle Bag Reservation",
    desc: "Polite reminder that artisan handcrafted pieces are reserved in the customer's shopping bag.",
  },
  {
    stage: 2,
    timing: "12 Hours",
    title: "Stage 2: High Demand & Urgency",
    desc: "Alerts that limited batch yardage and popularity may lead to sell out soon.",
  },
  {
    stage: 3,
    timing: "18 Hours",
    title: "Stage 3: Final Call Notice",
    desc: "Final notice before reserved items are released back to general public inventory.",
  },
];

export function CartReminderAdminTester() {
  const [recipientEmail, setRecipientEmail] = React.useState("nikhilsaisiddharth@gmail.com");
  const [selectedStage, setSelectedStage] = React.useState<CartReminderStage>(1);
  const [loading, setLoading] = React.useState(false);
  const [activeView, setActiveView] = React.useState<"htmlPreview" | "tester">("htmlPreview");
  const [result, setResult] = React.useState<{
    success: boolean;
    message: string;
    simulated?: boolean;
    preview?: any;
  } | null>(null);

  const sampleSubject = generateCartReminderSubject(SAMPLE_TEST_ITEMS, selectedStage);
  const sampleSubtotal = SAMPLE_TEST_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);

  const renderedHtml = React.useMemo(() => {
    return generateCartReminderHtml({
      customerName: "Nikhil",
      items: SAMPLE_TEST_ITEMS,
      subtotal: sampleSubtotal,
      cartUrl: typeof window !== "undefined" ? `${window.location.origin}/cart` : "http://localhost:3000/cart",
      stage: selectedStage,
    });
  }, [sampleSubtotal, selectedStage]);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      setResult({
        success: false,
        message: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/cart-reminder/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail.trim(),
          customerName: "Valued Customer",
          items: SAMPLE_TEST_ITEMS,
          subtotal: sampleSubtotal,
          stage: selectedStage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({
          success: true,
          message: data.message || "Email dispatched successfully!",
          simulated: data.simulated,
          preview: data.preview,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to send email. Check SMTP settings.",
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err?.message || "Network error while sending test email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Feature Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>3-Tier Sequence</span>
          </div>
          <p className="mt-2 text-xl font-bold text-neutral-900">3h ➔ 12h ➔ 18h</p>
          <p className="mt-1 text-xs text-neutral-600">
            Automated multi-stage journey with tailored copy and subjects.
          </p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Auto-Cancellation</span>
          </div>
          <p className="mt-2 text-xl font-bold text-neutral-900">Active</p>
          <p className="mt-1 text-xs text-neutral-600">
            Reminders automatically cancel as soon as the order is placed.
          </p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Sender Address</span>
          </div>
          <p className="mt-2 text-xl font-bold text-neutral-900">sales@sawbhagya.com</p>
          <p className="mt-1 text-xs text-neutral-600">
            Connected via GoDaddy Professional SMTP network.
          </p>
        </div>
      </div>

      {/* Stage Selector Tabs */}
      <div className="rounded-2xl border border-black/10 bg-white/80 p-3 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500 mb-2 px-1">
          Select Reminder Stage to Preview / Test:
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STAGE_OPTIONS.map((opt) => (
            <button
              key={opt.stage}
              type="button"
              onClick={() => setSelectedStage(opt.stage)}
              className={`flex flex-col text-left p-3 rounded-xl border transition ${
                selectedStage === opt.stage
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                  : "border-black/5 bg-white text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{opt.title}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedStage === opt.stage
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {opt.timing}
                </span>
              </div>
              <p
                className={`mt-1 text-[11px] leading-snug ${
                  selectedStage === opt.stage ? "text-neutral-300" : "text-neutral-500"
                }`}
              >
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-full border border-black/10 bg-white/80 p-1 text-xs font-semibold shadow-sm">
          <button
            type="button"
            onClick={() => setActiveView("htmlPreview")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition ${
              activeView === "htmlPreview"
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live Template Preview (Stage {selectedStage})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("tester")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition ${
              activeView === "tester"
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Email Test (Stage {selectedStage})</span>
          </button>
        </div>

        <div className="text-xs text-neutral-500 hidden sm:block">
          Official Sawbhagya SMTP Dispatches
        </div>
      </div>

      {/* VIEW 1: Live Interactive In-Browser Email Preview */}
      {activeView === "htmlPreview" && (
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 font-sans">
                Stage {selectedStage} Subject Line
              </div>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {sampleSubject}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Rendered HTML Ready
              </span>
            </div>
          </div>

          {/* Rendered Email Frame */}
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-neutral-100/50 p-2 sm:p-4">
            <iframe
              title="Cart Reminder Email Live Preview"
              srcDoc={renderedHtml}
              className="w-full rounded-xl border border-black/5 bg-white shadow-sm min-h-[680px]"
            />
          </div>
        </div>
      )}

      {/* VIEW 2: Interactive Test Sender */}
      {activeView === "tester" && (
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-sm ring-1 ring-black/[0.04] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-amber-400 shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Send Test Dispatch (Stage {selectedStage})
              </h3>
              <p className="text-xs text-neutral-600">
                Send a real test email for Stage {selectedStage} ({STAGE_OPTIONS[selectedStage - 1]?.timing}) directly to your inbox.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendTest} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="recipientEmail"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
              >
                Recipient Email Address
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="flex-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Stage {selectedStage} Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Feedback */}
            {result && (
              <div
                className={`mt-4 rounded-2xl border p-4 text-xs ${
                  result.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-900"
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{result.message}</p>
                    {result.preview && (
                      <p className="mt-1 text-[11px] opacity-80">
                        Subject: {result.preview.subject} (Items: {result.preview.itemCount})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
