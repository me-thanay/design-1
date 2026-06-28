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
  selectedColor?: string | null;
  selectedSize?: string | null;
  /** When product has options and none selected, call this instead of adding. */
  onSelectOptions?: () => void;
};

export function ProductCartControl({
  product,
  image,
  tone = "card",
  className,
  compact = false,
  selectedColor = null,
  selectedSize = null,
  onSelectOptions,
}: ProductCartControlProps) {
  const { addItem, qtyForProduct, increase, decrease } = useCart();
  const lineId = React.useMemo(() => {
    const c = (selectedColor ?? "").trim().toLowerCase();
    const s = (selectedSize ?? "").trim().toLowerCase();
    if (!c && !s) return product.id;
    return `${product.id}__${encodeURIComponent(c)}__${encodeURIComponent(s)}`;
  }, [product.id, selectedColor, selectedSize]);
  const qty = qtyForProduct(lineId);

  const cartPayload = React.useMemo(
    () => ({
      id: lineId,
      productId: product.id,
      name:
        (selectedColor || selectedSize)
          ? `${product.name}${selectedColor ? ` · ${selectedColor}` : ""}${selectedSize ? ` · ${selectedSize}` : ""}`
          : product.name,
      price: product.price,
      image,
      color: selectedColor,
      size: selectedSize,
    }),
    [lineId, product.id, product.name, product.price, image, selectedColor, selectedSize],
  );

  const handleFirstAdd = () => {
    const needsChoice = (product.colors?.length || product.sizes?.length) && !selectedColor && !selectedSize;
    if (needsChoice) {
      if (onSelectOptions) {
        onSelectOptions();
        return;
      }
      toast.error("Select color/size first", {
        description: "Open the product details and choose the correct options before adding to cart.",
      });
      return;
    }
    addItem(cartPayload, 1);
    toast.success("Successfully added to cart", {
      description: `${cartPayload.name} is in your cart.`,
    });
  };

  const onMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    decrease(lineId);
  };

  const onPlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    increase(lineId);
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
        "flex w-full items-center justify-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-sm ring-1 ring-emerald-900/[0.06]",
        className,
      )}
    >
      <button type="button" aria-label="Decrease quantity" onClick={onMinus} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/10 transition hover:bg-neutral-100">
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">{qty} in cart</span>
      </div>
      <button type="button" aria-label="Increase quantity" onClick={onPlus} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/10 transition hover:bg-neutral-100">
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
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
