"use client";

import * as React from "react";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import {
  AddedToCartNotification,
  type AddedNotificationData,
} from "./added-to-cart-notification";

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

type CartState = {
  items: CartItem[];
  lastUpdated?: number;
  reminderSentForHash?: string | null;
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
  /** Test trigger cart reminder email immediately */
  sendTestReminder: (targetEmail?: string) => Promise<{ ok: boolean; message?: string }>;
};

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "freelance-1.cart.v1";
const EMAIL_STORAGE_KEY = "sawbhagya.cart.email.v1";
const REMINDER_DELAY_MS = 5 * 60 * 1000; // 5 minutes delay

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
  const [reminderSentForHash, setReminderSentForHash] = React.useState<string | null>(null);

  const [addedNotification, setAddedNotification] = React.useState<AddedNotificationData | null>(null);

  // 1. Load initial cart and email from storage and Supabase auth
  React.useEffect(() => {
    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (stored?.items?.length) {
      setItems(stored.items);
      if (stored.lastUpdated) setLastUpdated(stored.lastUpdated);
      if (stored.reminderSentForHash) setReminderSentForHash(stored.reminderSentForHash);
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
      reminderSentForHash,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [items, lastUpdated, reminderSentForHash]);

  const setUserEmail = React.useCallback((email: string) => {
    const clean = email.trim().toLowerCase();
    setUserEmailState(clean);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(EMAIL_STORAGE_KEY, clean);
    }
  }, []);

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

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
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
  };

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
    setReminderSentForHash(null);
    if (userEmail) {
      fetch("/api/cart-reminder/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      }).catch(() => {});
    }
  };

  const sendTestReminder = React.useCallback(
    async (targetEmail?: string) => {
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

  // 3. Automated 5-Minute Cart Waiting Email Reminder Scheduler
  React.useEffect(() => {
    if (items.length === 0 || !userEmail) return;

    const currentHash = getCartHash(items);
    if (reminderSentForHash === currentHash) return;

    const checkAndTriggerReminder = async () => {
      const timeSinceUpdate = Date.now() - lastUpdated;

      if (timeSinceUpdate >= REMINDER_DELAY_MS && reminderSentForHash !== currentHash) {
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
            }),
          });

          const data = await res.json();
          if (data.ok) {
            setReminderSentForHash(currentHash);
          }
        } catch {
          // silently handle network error, retry next interval
        }
      }
    };

    // Check periodically every 20 seconds
    const interval = setInterval(checkAndTriggerReminder, 20000);
    return () => clearInterval(interval);
  }, [items, userEmail, userName, lastUpdated, reminderSentForHash]);

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
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
