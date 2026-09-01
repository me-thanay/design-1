"use client";

import * as React from "react";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import {
  AddedToCartNotification,
  type AddedNotificationData,
} from "./added-to-cart-notification";
import { SoftSignInModal } from "./soft-sign-in-modal";

import { type CartReminderStage } from "@/lib/cart-reminder-email";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number; // numeric amount in INR
  image?: string;
  qty: number;
  color?: string | null;
  size?: string | null;
};

export const REMINDER_TIERS: Array<{ stage: CartReminderStage; delayMs: number; label: string }> = [
  { stage: 1, delayMs: 3 * 60 * 60 * 1000, label: "3 Hours · Gentle Bag Reservation" },
  { stage: 2, delayMs: 12 * 60 * 60 * 1000, label: "12 Hours · High Demand & Urgency Alert" },
  { stage: 3, delayMs: 18 * 60 * 60 * 1000, label: "18 Hours · Final Call Before Release" },
];

type CartState = {
  items: CartItem[];
  lastUpdated?: number;
  sentStagesByHash?: Record<string, number[]>;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  userEmail: string | null;
  /** Set or update customer email for cart tracking and reminders */
  setUserEmail: (email: string) => void;
  /** Quantity of this product line in the cart (0 if not in cart). */
  qtyForProduct: (lineId: string) => number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  clear: () => void;
  /** Trigger luxury add to cart popup manually if needed */
  showAddedNotification: (item: CartItem) => void;
  /** Test trigger cart reminder email immediately with optional stage 1, 2, or 3 */
  sendTestReminder: (targetEmail?: string, stage?: CartReminderStage) => Promise<{ ok: boolean; message?: string }>;
};

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "freelance-1.cart.v1";
const EMAIL_STORAGE_KEY = "sawbhagya.cart.email.v1";

function safeParse(json: string | null): CartState | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as CartState;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getCartHash(items: CartItem[]): string {
  if (!items || items.length === 0) return "";
  return items
    .map((i) => `${i.id}:${i.qty}:${i.price}`)
    .sort()
    .join("|");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [userEmail, setUserEmailState] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<number>(Date.now());
  const [sentStagesByHash, setSentStagesByHash] = React.useState<Record<string, number[]>>({});

  const [addedNotification, setAddedNotification] = React.useState<AddedNotificationData | null>(null);
  const [pendingAuthItem, setPendingAuthItem] = React.useState<CartItem | null>(null);

  // 1. Load initial cart and email from storage and Supabase auth
  React.useEffect(() => {
    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (stored?.items?.length) {
      setItems(stored.items);
      if (stored.lastUpdated) setLastUpdated(stored.lastUpdated);
      if (stored.sentStagesByHash) setSentStagesByHash(stored.sentStagesByHash);
    }

    const savedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmail) setUserEmailState(savedEmail);

    if (supabaseEnabled) {
      supabase.auth.getUser().then(({ data }: any) => {
        const u = data?.user;
        if (u?.email) {
          setUserEmailState(u.email);
          const name =
            (u.user_metadata as any)?.full_name ||
            (u.user_metadata as any)?.name ||
            u.email.split("@")[0];
          if (name) setUserName(name);
          window.localStorage.setItem(EMAIL_STORAGE_KEY, u.email);
        }
      }).catch(() => {});
    }
  }, []);

  // 2. Persist cart state to localStorage
  React.useEffect(() => {
    const state: CartState = {
      items,
      lastUpdated,
      sentStagesByHash,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [items, lastUpdated, sentStagesByHash]);

  const setUserEmail = React.useCallback((email: string) => {
    const clean = email.trim().toLowerCase();
    setUserEmailState(clean);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, clean);
    }
  }, []);

  const doAddItem = React.useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    const safeQty = Math.max(1, Math.floor(qty));
    const fullItem: CartItem = { ...item, qty: safeQty };

    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      let updated: CartItem[];
      if (!existing) {
        updated = [...prev, fullItem];
      } else {
        updated = prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + safeQty } : p,
        );
      }

      // Show luxury flyout notification
      const count = updated.reduce((sum, i) => sum + i.qty, 0);
      const total = updated.reduce((sum, i) => sum + i.price * i.qty, 0);
      setAddedNotification({
        item: { ...item, qty: safeQty },
        itemCount: count,
        subtotal: total,
      });

      return updated;
    });

    const now = Date.now();
    setLastUpdated(now);

    // Sync activity with server tracking
    if (userEmail) {
      fetch("/api/cart-reminder/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          items: [...items, fullItem],
          subtotal: [...items, fullItem].reduce((sum, i) => sum + i.price * i.qty, 0),
        }),
      }).catch(() => {});
    }
  }, [items, userEmail]);

  // Check for pending item saved before Google OAuth redirect
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("sawbhagya.pending.cart_add");
    if (raw) {
      try {
        const item = JSON.parse(raw) as CartItem;
        if (item && item.id) {
          window.localStorage.removeItem("sawbhagya.pending.cart_add");
          doAddItem(item, item.qty || 1);
        }
      } catch {}
    }
  }, [doAddItem]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    const isGuestSession =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("sawbhagya.guest_session") === "true";

    // If not logged in and has not selected guest mode in this session, softly prompt Google sign-in
    if (!userEmail && !isGuestSession && items.length === 0) {
      setPendingAuthItem({ ...item, qty: Math.max(1, Math.floor(qty)) });
      return;
    }

    doAddItem(item, qty);
  };

  const handleContinueAsGuest = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("sawbhagya.guest_session", "true");
    }
    if (pendingAuthItem) {
      doAddItem(pendingAuthItem, pendingAuthItem.qty);
      setPendingAuthItem(null);
    }
  }, [pendingAuthItem, doAddItem]);

  const showAddedNotification = React.useCallback(
    (item: CartItem) => {
      const currentItems = items.some((i) => i.id === item.id)
        ? items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i))
        : [...items, item];
      const count = currentItems.reduce((sum, i) => sum + i.qty, 0);
      const total = currentItems.reduce((sum, i) => sum + i.price * i.qty, 0);

      setAddedNotification({
        item,
        itemCount: count,
        subtotal: total,
      });
    },
    [items],
  );

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    setLastUpdated(Date.now());
  };

  const setQty: CartContextValue["setQty"] = (id, qty) => {
    const safeQty = Math.max(1, Math.floor(qty));
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: safeQty } : p)),
    );
    setLastUpdated(Date.now());
  };

  const increase: CartContextValue["increase"] = (id) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)),
    );
    setLastUpdated(Date.now());
  };

  const decrease: CartContextValue["decrease"] = (id) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0),
    );
    setLastUpdated(Date.now());
  };

  const clear: CartContextValue["clear"] = () => {
    setItems([]);
    setSentStagesByHash({});
    if (userEmail) {
      fetch("/api/cart-reminder/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      }).catch(() => {});
    }
  };

  const sendTestReminder = React.useCallback(
    async (targetEmail?: string, stage: CartReminderStage = 1) => {
      const recipient = targetEmail || userEmail;
      if (!recipient || !recipient.includes("@")) {
        return { ok: false, message: "Please provide a valid email address." };
      }

      const testItems = items.length > 0 ? items : [
        {
          id: "sample-1",
          productId: "1",
          name: "Zari Embroidered Designer Blouse · Maroon",
          price: 2499,
          qty: 1,
          color: "Maroon",
          size: "M",
          image: "/images/hero1.jpg",
        },
      ];

      const testSubtotal = testItems.reduce((sum, i) => sum + i.price * i.qty, 0);

      try {
        const res = await fetch("/api/cart-reminder/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: recipient,
            customerName: userName,
            items: testItems,
            subtotal: testSubtotal,
            stage,
          }),
        });
        const data = await res.json();
        return {
          ok: data.ok ?? false,
          message: data.message || data.error || (data.simulated ? "Simulated in development" : "Sent"),
        };
      } catch (err: any) {
        return { ok: false, message: err?.message || "Failed to send test email." };
      }
    },
    [items, userEmail, userName],
  );

  // 3. Automated 3-Tier Multi-Stage Cart Waiting Email Reminder Scheduler (3h, 12h, 18h)
  React.useEffect(() => {
    if (items.length === 0 || !userEmail) return;

    const currentHash = getCartHash(items);
    if (!currentHash) return;

    const checkAndTriggerReminders = async () => {
      const timeSinceUpdate = Date.now() - lastUpdated;
      const sentStages = sentStagesByHash[currentHash] || [];

      for (const tier of REMINDER_TIERS) {
        if (timeSinceUpdate >= tier.delayMs && !sentStages.includes(tier.stage)) {
          try {
            const subtotalCalc = items.reduce((sum, i) => sum + i.price * i.qty, 0);
            const res = await fetch("/api/cart-reminder/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: userEmail,
                customerName: userName,
                items,
                subtotal: subtotalCalc,
                stage: tier.stage,
              }),
            });

            const data = await res.json();
            if (data.ok) {
              setSentStagesByHash((prev) => ({
                ...prev,
                [currentHash]: [...(prev[currentHash] || []), tier.stage],
              }));
            }
          } catch {
            // Silently retry on next check interval
          }
        }
      }
    };

    // Check periodically every 30 seconds
    const interval = setInterval(checkAndTriggerReminders, 30000);
    // Also run immediate check
    void checkAndTriggerReminders();

    return () => clearInterval(interval);
  }, [items, userEmail, userName, lastUpdated, sentStagesByHash]);

  const value = React.useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const qtyForProduct = (lineId: string) =>
      items.find((i) => i.id === lineId)?.qty ?? 0;
    return {
      items,
      itemCount,
      subtotal,
      userEmail,
      setUserEmail,
      qtyForProduct,
      addItem,
      removeItem,
      setQty,
      increase,
      decrease,
      clear,
      showAddedNotification,
      sendTestReminder,
    };
  }, [items, userEmail, setUserEmail, showAddedNotification, sendTestReminder]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <AddedToCartNotification
        data={addedNotification}
        onClose={() => setAddedNotification(null)}
      />
      <SoftSignInModal
        open={Boolean(pendingAuthItem)}
        item={pendingAuthItem}
        onContinueAsGuest={handleContinueAsGuest}
        onClose={handleContinueAsGuest}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
