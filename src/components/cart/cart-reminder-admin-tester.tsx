"use client";

import * as React from "react";
import { Mail, Send, CheckCircle2, Clock, ShieldCheck, Sparkles, Loader2, AlertCircle, Eye, RefreshCw } from "lucide-react";
import { generateCartReminderHtml, generateCartReminderSubject } from "@/lib/cart-reminder-email";
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

export function CartReminderAdminTester() {
  const [recipientEmail, setRecipientEmail] = React.useState("nikhilsaisiddharth@gmail.com");
  const [loading, setLoading] = React.useState(false);
  const [activeView, setActiveView] = React.useState<"tester" | "htmlPreview">("htmlPreview");
  const [result, setResult] = React.useState<{
    success: boolean;
    message: string;
    simulated?: boolean;
    preview?: any;
  } | null>(null);

  const sampleSubject = generateCartReminderSubject(SAMPLE_TEST_ITEMS);
  const sampleSubtotal = SAMPLE_TEST_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);

  const renderedHtml = React.useMemo(() => {
    return generateCartReminderHtml({
      customerName: "Nikhil",
      items: SAMPLE_TEST_ITEMS,
      subtotal: sampleSubtotal,
      cartUrl: typeof window !== "undefined" ? `${window.location.origin}/cart` : "http://localhost:3000/cart",
    });
  }, [sampleSubtotal]);

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
            <span>Automated Timing</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">5 Minutes</p>
          <p className="mt-1 text-xs text-neutral-600">
            Automatically sends reminder 5 min after item is added.
          </p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Auto-Cancellation</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">Active</p>
          <p className="mt-1 text-xs text-neutral-600">
            Cancels reminder automatically upon order checkout.
          </p>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Testing Mode</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-neutral-900">Zero Setup Ready</p>
          <p className="mt-1 text-xs text-neutral-600">
            Works out of the box with live visual preview & simulated logs.
          </p>
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
            <span>Live Email Template Preview</span>
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
            <span>Send Email Test</span>
          </button>
        </div>

        <div className="text-xs text-neutral-500 hidden sm:block">
          No Vercel login required for local testing
        </div>
      </div>

      {/* VIEW 1: Live Interactive In-Browser Email Preview */}
      {activeView === "htmlPreview" && (
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm ring-1 ring-black/[0.04]">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 font-sans">
                Subject Line Preview
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
                Test Cart Reminder Dispatcher
              </h3>
              <p className="text-xs text-neutral-600">
                Trigger a dispatch to test either simulated terminal logging or your own personal Gmail SMTP.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendTest} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Recipient Email Address
              </label>
              <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="Enter recipient email (e.g. yourname@gmail.com)"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="flex-1 rounded-2xl border border-black/15 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-amber-400" />
                      <span>Send Test Trigger</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {result && (
              <div
                className={`rounded-2xl border p-4 text-sm ${
                  result.success
                    ? result.simulated
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-900"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {result.success ? (
                    result.simulated ? (
                      <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    )
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                  )}
                  <div>
                    <p className="font-semibold">{result.message}</p>
                    {result.simulated ? (
                      <div className="mt-1 text-xs text-amber-800 space-y-1">
                        <p>
                          ✓ Simulated successfully! The email payload and subject line were logged to your terminal.
                        </p>
                        <p className="pt-1">
                          To deliver to your real inbox without needing Vercel, you can put any personal Gmail credentials directly into your local <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">.env.local</code> file.
                        </p>
                      </div>
                    ) : null}
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
