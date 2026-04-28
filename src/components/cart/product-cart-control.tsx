"use client";

import * as React from "react";
import { CheckCircle2, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { useCart } from "./CartProvider";

export type ProductCartControlTone = "card" | "onImage" | "heroDark";

type ProductCartControlProps = {
  product: Product;
  image: string;
  tone?: ProductCartControlTone;
  className?: string;
  /** Tighter paddings for gallery captions */
  compact?: boolean;
};

export function ProductCartControl({
  product,
  image,
  tone = "card",
  className,
  compact = false,
}: ProductCartControlProps) {
  const { addItem, qtyForProduct, increase, decrease } = useCart();
  const qty = qtyForProduct(product.id);

  const cartPayload = React.useMemo(
    () => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image,
    }),
    [product.id, product.name, product.price, image],
  );

  const handleFirstAdd = () => {
    addItem(cartPayload, 1);
    toast.success("Successfully added to cart", {
      description: `${product.name} is in your cart.`,
    });
  };

  const onMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    decrease(product.id);
  };

  const onPlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    increase(product.id);
  };

  if (qty === 0) {
    if (tone === "onImage") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-full rounded-full border-2 border-white bg-white/95 px-3 text-xs font-semibold text-neutral-900 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white hover:shadow-lg active:translate-y-0 sm:h-9 sm:text-sm",
            className,
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFirstAdd();
          }}
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          Add to cart
        </Button>
      );
    }

    if (tone === "heroDark") {
      return (
        <button
          type="button"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800",
            className,
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFirstAdd();
          }}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden />
          Add to cart
        </button>
      );
    }

    return (
      <Button
        type="button"
        className={cn("w-full rounded-full font-semibold", className)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFirstAdd();
        }}
      >
        <ShoppingBag className="mr-2 h-4 w-4 shrink-0" aria-hidden />
        Add to cart
      </Button>
    );
  }

  if (tone === "onImage") {
    return (
      <div
        className={cn(
          "flex w-full flex-col gap-2 rounded-2xl border border-white/30 bg-gradient-to-br from-emerald-400/30 via-emerald-900/45 to-neutral-950/55 p-2 shadow-xl backdrop-blur-md ring-1 ring-white/25",
          compact && "gap-1.5 p-1.5",
          className,
        )}
      >
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-50 sm:text-[11px]">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden />
          In your cart
        </div>
        <StepperRow
          qty={qty}
          onMinus={onMinus}
          onPlus={onPlus}
          variant="onImage"
          compact={compact}
        />
      </div>
    );
  }

  if (tone === "heroDark") {
    return (
      <div
        className={cn(
          "flex w-full flex-col gap-2.5 rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-3 text-white shadow-lg ring-1 ring-emerald-300/30",
          className,
        )}
      >
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-50">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" aria-hidden />
          In your cart
        </div>
        <StepperRow qty={qty} onMinus={onMinus} onPlus={onPlus} variant="heroDark" compact={false} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/95 via-white to-white p-2.5 shadow-md ring-1 ring-emerald-900/[0.07]",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
        In your cart
      </div>
      <StepperRow qty={qty} onMinus={onMinus} onPlus={onPlus} variant="card" compact={compact} />
    </div>
  );
}

function StepperRow({
  qty,
  onMinus,
  onPlus,
  variant,
  compact,
}: {
  qty: number;
  onMinus: (e: React.MouseEvent) => void;
  onPlus: (e: React.MouseEvent) => void;
  variant: "card" | "onImage" | "heroDark";
  compact: boolean;
}) {
  const size = compact ? "h-7 w-7 text-sm" : "h-9 w-9 text-base";
  const iconSm = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  const minusPlus =
    variant === "card"
      ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
      : variant === "onImage"
        ? "border border-white/25 bg-white/15 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        : "border border-emerald-300/40 bg-emerald-950/35 text-white hover:bg-emerald-950/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900";

  const inner =
    variant === "card"
      ? "bg-white shadow-inner ring-1 ring-neutral-200/90"
      : variant === "onImage"
        ? "border border-white/20 bg-black/30"
        : "border border-emerald-400/35 bg-emerald-950/40";

  return (
    <div className={cn("flex items-center justify-between gap-2 rounded-xl p-1", inner)}>
      <button type="button" aria-label="Decrease quantity" className={cn("flex shrink-0 items-center justify-center rounded-xl font-semibold transition", size, minusPlus)} onClick={onMinus}>
        <Minus className={iconSm} strokeWidth={2.5} />
      </button>
      <span
        className={cn(
          "min-w-[2rem] text-center font-bold tabular-nums",
          compact ? "text-base" : "text-lg",
          variant === "card" && "text-neutral-900",
          variant === "onImage" && "text-white drop-shadow-md",
          variant === "heroDark" && "text-white",
        )}
      >
        {qty}
      </span>
      <button type="button" aria-label="Increase quantity" className={cn("flex shrink-0 items-center justify-center rounded-xl font-semibold transition", size, minusPlus)} onClick={onPlus}>
        <Plus className={iconSm} strokeWidth={2.5} />
      </button>
    </div>
  );
}
