"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, X, Sparkles } from "lucide-react";
import type { CartItem } from "./CartProvider";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type AddedNotificationData = {
  item: CartItem;
  itemCount: number;
  subtotal: number;
};

type AddedToCartNotificationProps = {
  data: AddedNotificationData | null;
  onClose: () => void;
  autoCloseMs?: number;
};

export function AddedToCartNotification({
  data,
  onClose,
  autoCloseMs = 5000,
}: AddedToCartNotificationProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = React.useState(false);
  const [progress, setProgress] = React.useState(100);

  const startTimeRef = React.useRef<number>(Date.now());
  const remainingTimeRef = React.useRef<number>(autoCloseMs);

  React.useEffect(() => {
    if (!data) return;

    setProgress(100);
    remainingTimeRef.current = autoCloseMs;
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (isHovered) {
        startTimeRef.current = Date.now();
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const newPercent = (newRemaining / autoCloseMs) * 100;
      setProgress(newPercent);

      if (newRemaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [data, isHovered, autoCloseMs, onClose]);

  if (!data) return null;

  const { item, itemCount, subtotal } = data;
  const cleanItemName = item.name.split("·")[0].trim();

  return (
    <div
      className="fixed inset-x-3 top-4 z-[9999] flex justify-center sm:inset-x-auto sm:right-6 sm:top-6 sm:justify-end pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Added to Cart Notification"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="pointer-events-auto w-full max-w-md overflow-hidden rounded-3xl border border-black/10 bg-white/95 text-neutral-900 shadow-2xl backdrop-blur-xl ring-1 ring-black/[0.04]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          startTimeRef.current = Date.now();
        }}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-amber-50/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20">
              <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-900 font-sans">
              Added to Your Bag
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-black/5 hover:text-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product Details Section */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Product Thumbnail */}
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-neutral-100 shadow-sm">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="min-w-0 flex-1">
              <h4 className="font-heading truncate text-base font-bold text-neutral-900">
                {cleanItemName}
              </h4>

              {/* Variant chips */}
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-600">
                {item.color ? (
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
                    Color: {item.color}
                  </span>
                ) : null}
                {item.size ? (
                  <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
                    Size: {item.size}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  {formatINR(item.price)}
                </span>
                <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  Qty: {item.qty}
                </span>
              </div>
            </div>
          </div>

          {/* Subtotal & Free Express Shipping Info */}
          <div className="mt-4 rounded-2xl border border-black/5 bg-neutral-50/80 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-600">
                Bag Total ({itemCount} {itemCount === 1 ? "item" : "items"}):
              </span>
              <span className="font-bold text-neutral-900 tabular-nums text-sm">
                {formatINR(subtotal)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <Sparkles className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>Free Express Delivery & Quality Guarantee applied</span>
            </div>
          </div>

          {/* Action Buttons styled in Sawbhagya signature pill format */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/cart");
              }}
              className="group flex items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98]"
            >
              <span>View Bag & Checkout</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/10 bg-white/80 px-4 py-2.5 text-xs font-semibold text-neutral-800 transition hover:bg-white active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Dismiss Timer Progress Bar */}
        <div className="h-1 w-full bg-neutral-100">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </div>
  );
}
