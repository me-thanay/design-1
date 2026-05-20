"use client";

import * as React from "react";
import { CartProvider } from "@/components/cart/CartProvider";

export function CartProviderClient({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

