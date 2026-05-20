"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { PageShell } from "@/components/ui/page-shell";
import { CartCheckoutFlow } from "@/components/cart/cart-checkout-flow";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export default function CartPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { itemCount, clear } = useCart();

  return (
    <PageShell
      eyebrow="Cart"
      title="Your cart"
      subtitle="Step through bag, contact, delivery, and payment — then place your order."
    >
      <ScrollReveal variant="fade-down" y={20}>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="rounded-full border-black/10 bg-white/70 transition-shadow hover:bg-white hover:shadow-md"
                onClick={() => router.push("/")}
              >
                Continue shopping
              </Button>
            </motion.div>
            {itemCount > 0 ? (
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="rounded-full border-black/10 bg-white/70 transition-shadow hover:bg-white hover:shadow-md"
                  onClick={clear}
                >
                  Clear cart
                </Button>
              </motion.div>
            ) : null}
          </div>
          <div className="text-xs font-medium text-neutral-600">
            {itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"}` : "No items yet"}
          </div>
        </div>
      </ScrollReveal>

      <CartCheckoutFlow />
    </PageShell>
  );
}
