"use client";

import * as React from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number; // numeric amount in INR
  image?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  /** Quantity of this product line in the cart (0 if not in cart). */
  qtyForProduct: (productId: string) => number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  clear: () => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "freelance-1.cart.v1";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
    if (stored?.items?.length) setItems(stored.items);
  }, []);

  React.useEffect(() => {
    const state: CartState = { items };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    const safeQty = Math.max(1, Math.floor(qty));
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (!existing) return [...prev, { ...item, qty: safeQty }];
      return prev.map((p) =>
        p.id === item.id ? { ...p, qty: p.qty + safeQty } : p,
      );
    });
  };

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const setQty: CartContextValue["setQty"] = (id, qty) => {
    const safeQty = Math.max(1, Math.floor(qty));
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: safeQty } : p)),
    );
  };

  const increase: CartContextValue["increase"] = (id) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)),
    );
  };

  const decrease: CartContextValue["decrease"] = (id) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0),
    );
  };

  const clear: CartContextValue["clear"] = () => setItems([]);

  const value = React.useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const qtyForProduct = (productId: string) =>
      items.find((i) => i.id === productId)?.qty ?? 0;
    return {
      items,
      itemCount,
      subtotal,
      qtyForProduct,
      addItem,
      removeItem,
      setQty,
      increase,
      decrease,
      clear,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

