"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/cart/CartProvider";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { SCROLL_REVEAL_EASE } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

const LOCAL_ORDERS_KEY = "freelance-1.local.orders.v1";

const CHECKOUT_STEPS = [
  { id: "bag", title: "Your bag" },
  { id: "contact", title: "Contact" },
  { id: "delivery", title: "Delivery" },
  { id: "payment", title: "Payment" },
  { id: "review", title: "Review" },
] as const;

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const contentVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: SCROLL_REVEAL_EASE } },
  exit: { opacity: 0, x: -28, transition: { duration: 0.2, ease: SCROLL_REVEAL_EASE } },
};

export function CartCheckoutFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { items, itemCount, subtotal, increase, decrease, removeItem, clear } = useCart();

  const shipping = 0;
  const total = subtotal + shipping;
  const isEmpty = items.length === 0;

  const [currentStep, setCurrentStep] = React.useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [locationMode, setLocationMode] = React.useState<"current" | "manual">("manual");
  const [manualLocation, setManualLocation] = React.useState("");
  const [currentLocation, setCurrentLocation] = React.useState<string | null>(null);
  const [currentMapsUrl, setCurrentMapsUrl] = React.useState<string | null>(null);
  const [locationStatus, setLocationStatus] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<"cod" | "upi" | "card">("cod");
  const [cardName, setCardName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvv, setCardCvv] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  const lastStep = CHECKOUT_STEPS.length - 1;
  const progress =
    lastStep <= 0 ? 0 : Math.round((currentStep / lastStep) * 100);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location not supported in this browser.");
      return;
    }
    setLocationStatus("Getting current location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const maps = `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}`;
        setCurrentMapsUrl(maps);
        setLocationMode("current");
        try {
          setLocationStatus("Getting your address…");
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          const data = (await res.json()) as { display_name?: string };
          const address = typeof data?.display_name === "string" ? data.display_name : null;
          const nice =
            address ??
            `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lon}`)}`;
          setCurrentLocation(nice);
          setLocationStatus(
            address ? "Address detected from your location." : "Location captured.",
          );
        } catch {
          setCurrentLocation(maps);
          setLocationStatus("Location captured. Tap to open in Maps.");
        }
      },
      () => {
        setLocationStatus(
          "Could not get location. Please allow permission or use manual address.",
        );
      },
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !isEmpty;
      case 1:
        return phone.trim() !== "";
      case 2:
        if (locationMode === "manual") return manualLocation.trim() !== "";
        return Boolean(currentLocation);
      case 3:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    setFormError(null);
    if (currentStep < lastStep && isStepValid()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setFormError(null);
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const goToStep = (index: number) => {
    if (index <= currentStep) {
      setFormError(null);
      setCurrentStep(index);
    }
  };

  const handleBuy = async () => {
    if (isEmpty || isPlacingOrder) return;

    if (supabaseEnabled) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/sign-in?to=cart");
        return;
      }
    }

    if (!phone.trim()) {
      const msg = "Please enter your phone number.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (locationMode === "manual" && !manualLocation.trim()) {
      const msg = "Please enter your delivery address.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (locationMode === "current" && !currentLocation) {
      const msg =
        "Current location not available. Use ‘Use current location’ or switch to manual address.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (paymentMethod === "card") {
      const cardNo = cardNumber.replace(/\s+/g, "");
      if (!cardName.trim()) {
        const msg = "Please enter the card holder name.";
        setFormError(msg);
        toast.error(msg);
        return;
      }
      if (!/^\d{12,19}$/.test(cardNo)) {
        const msg = "Please enter a valid card number.";
        setFormError(msg);
        toast.error(msg);
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        const msg = "Please enter expiry as MM/YY.";
        setFormError(msg);
        toast.error(msg);
        return;
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        const msg = "Please enter a valid CVV.";
        setFormError(msg);
        toast.error(msg);
        return;
      }
    }

    setFormError(null);
    setIsPlacingOrder(true);

    try {
      let customerEmail: string | null = null;
      if (supabaseEnabled) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        customerEmail = user?.email ?? null;
      }

      const payload = {
        customer_email: customerEmail,
        customer_phone: phone.trim(),
        location_mode: locationMode,
        location_manual:
          locationMode === "manual"
            ? manualLocation.trim()
            : locationMode === "current"
              ? currentLocation
              : null,
        location_coords: locationMode === "current" ? currentMapsUrl ?? currentLocation : null,
        payment_method: paymentMethod,
        currency: "INR",
        status: paymentMethod === "card" ? "payment-requested" : "pending",
        subtotal,
        shipping,
        total,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image ?? null,
          lineTotal: i.price * i.qty,
        })),
      };

      if (!supabaseEnabled) {
        const prevRaw = window.localStorage.getItem(LOCAL_ORDERS_KEY);
        const prev = prevRaw ? (JSON.parse(prevRaw) as unknown[]) : [];
        const order = { id: Date.now(), created_at: new Date().toISOString(), ...payload };
        window.localStorage.setItem(
          LOCAL_ORDERS_KEY,
          JSON.stringify([order, ...(Array.isArray(prev) ? prev : [])]),
        );
      } else {
        const { error } = await supabase.from("orders").insert(payload);
        if (error) throw error;
      }

      clear();
      toast.success(
        paymentMethod === "card"
          ? "Card payment request sent. We’ll contact you to confirm securely."
          : "Order placed! We’ll contact you shortly to confirm.",
      );
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not place order. Please try again.";
      toast.error(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isEmpty) {
    return (
      <motion.div
        className="rounded-3xl border border-dashed border-black/20 bg-white/50 p-10 text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: SCROLL_REVEAL_EASE }}
      >
        <ShoppingBag className="mx-auto h-10 w-10 text-neutral-400" aria-hidden />
        <p className="mt-4 text-sm font-medium text-neutral-900">Your cart is empty.</p>
        <p className="mt-1 text-xs text-neutral-600">
          Browse the shop and add pieces you love.
        </p>
        <Button className="mt-6 rounded-full" onClick={() => router.push("/#shop")}>
          Browse items
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-8">
      <motion.div
        className="mb-8"
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: SCROLL_REVEAL_EASE }}
      >
        <div className="flex justify-between gap-2 overflow-x-auto pb-2">
          {CHECKOUT_STEPS.map((step, index) => (
            <motion.button
              key={step.id}
              type="button"
              className="flex min-w-[4.5rem] flex-col items-center gap-1.5"
              onClick={() => goToStep(index)}
              disabled={index > currentStep}
              whileHover={index <= currentStep && !reduceMotion ? { scale: 1.06 } : undefined}
              whileTap={index <= currentStep && !reduceMotion ? { scale: 0.96 } : undefined}
            >
              <motion.div
                className={cn(
                  "h-3.5 w-3.5 rounded-full transition-colors duration-300",
                  index < currentStep
                    ? "bg-primary"
                    : index === currentStep
                      ? "bg-primary ring-4 ring-primary/20"
                      : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium sm:text-xs",
                  index === currentStep ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </motion.button>
          ))}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: SCROLL_REVEAL_EASE }}
          />
        </div>
      </motion.div>

      <Card className="overflow-hidden rounded-3xl border border-black/10 shadow-md ring-1 ring-black/[0.04]">
        <div className="border-b border-black/5 bg-white/50 px-6 py-3 text-right">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total
          </span>
          <p className="text-lg font-semibold text-neutral-900">{formatINR(total)}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
          >
            {currentStep === 0 && (
              <>
                <CardHeader>
                  <CardTitle>Your bag</CardTitle>
                  <CardDescription>
                    Adjust quantities or remove items before checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout={!reduceMotion}
                      className="flex gap-3 rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-neutral-900 line-clamp-2">
                            {item.name}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-red-700 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 rounded-full p-0"
                              onClick={() => decrease(item.id)}
                            >
                              −
                            </Button>
                            <span className="min-w-8 text-center text-sm font-medium">
                              {item.qty}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 rounded-full p-0"
                              onClick={() => increase(item.id)}
                            >
                              +
                            </Button>
                          </div>
                          <p className="text-sm font-semibold">{formatINR(item.price * item.qty)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </>
            )}

            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                  <CardDescription>We’ll use this number for order updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cart-phone">Phone number</Label>
                    <Input
                      id="cart-phone"
                      type="tel"
                      placeholder="+91 99164 77992"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Delivery</CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={locationMode}
                    onValueChange={(v) => setLocationMode(v as "current" | "manual")}
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {[
                      { value: "current" as const, label: "Use current location" },
                      { value: "manual" as const, label: "Enter address" },
                    ].map((opt) => (
                      <motion.div
                        key={opt.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/60",
                          locationMode === opt.value ? "border-primary/40 bg-accent/30" : "",
                        )}
                        whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                      >
                        <RadioGroupItem value={opt.value} id={`loc-${opt.value}`} />
                        <Label htmlFor={`loc-${opt.value}`} className="cursor-pointer text-sm font-medium">
                          {opt.label}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>

                  {locationMode === "manual" ? (
                    <div className="space-y-2">
                      <Label htmlFor="addr">Full address</Label>
                      <Textarea
                        id="addr"
                        placeholder="House/flat, street, area, city, pincode"
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        className="min-h-[100px] rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={handleUseCurrentLocation}
                      >
                        Detect my location
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {currentLocation
                          ? `Captured: ${currentLocation}`
                          : "Allow location access in your browser when prompted."}
                      </p>
                    </div>
                  )}
                  {locationStatus ? (
                    <p className="text-xs text-neutral-600">{locationStatus}</p>
                  ) : null}
                </CardContent>
              </>
            )}

            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                  <CardDescription>Choose how you’d like to pay.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as "cod" | "upi" | "card")}
                    className="grid gap-2"
                  >
                    {[
                      { value: "cod" as const, label: "Cash on delivery (COD)" },
                      { value: "upi" as const, label: "UPI" },
                      { value: "card" as const, label: "Card" },
                    ].map((opt, i) => (
                      <motion.div
                        key={opt.value}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/50",
                          paymentMethod === opt.value ? "border-primary/40 bg-accent/25" : "",
                        )}
                        initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: reduceMotion ? 0 : i * 0.05, duration: 0.25 }}
                        whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                      >
                        <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} />
                        <Label htmlFor={`pay-${opt.value}`} className="cursor-pointer flex-1 text-sm">
                          {opt.label}
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>

                  {paymentMethod === "upi" ? (
                    <div className="grid gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div>
                        <p className="text-sm font-semibold">Scan to pay via UPI</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          We’ll confirm your order on WhatsApp or call after payment.
                        </p>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/company_logo/upi_scanner.jpeg"
                        alt="UPI QR"
                        className="h-40 w-40 rounded-xl border border-black/10 object-contain"
                      />
                    </div>
                  ) : null}

                  {paymentMethod === "card" ? (
                    <div className="space-y-2 rounded-2xl border border-black/10 bg-white/80 p-4">
                      <Input
                        placeholder="Card holder name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="rounded-xl"
                      />
                      <Input
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(
                            e.target.value
                              .replace(/[^\d]/g, "")
                              .slice(0, 19)
                              .replace(/(\d{4})(?=\d)/g, "$1 "),
                          )
                        }
                        className="rounded-xl"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                            setCardExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                          }}
                          className="rounded-xl"
                        />
                        <Input
                          type="password"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={(e) =>
                            setCardCvv(e.target.value.replace(/[^\d]/g, "").slice(0, 4))
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Card details are not stored on our servers.
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </>
            )}

            {currentStep === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Review & place order</CardTitle>
                  <CardDescription>Confirm everything looks correct.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-xl border border-black/10 bg-white/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Items ({itemCount})
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {items.map((i) => (
                        <li key={i.id} className="flex justify-between gap-2 text-neutral-800">
                          <span className="line-clamp-1">
                            {i.name} × {i.qty}
                          </span>
                          <span className="shrink-0 font-medium">{formatINR(i.price * i.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid gap-2 rounded-xl border border-black/10 bg-white/70 p-4 text-neutral-800">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{phone || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="max-w-[65%] text-right text-xs font-medium">
                        {locationMode === "manual"
                          ? manualLocation || "—"
                          : currentLocation || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium uppercase">{paymentMethod}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-black/10 pt-2 text-base font-semibold">
                      <span>Total</span>
                      <span>{formatINR(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <CardFooter className="flex flex-wrap justify-between gap-3 border-t border-black/5 bg-white/40 px-6 py-4">
          <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="rounded-2xl"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          </motion.div>

          {currentStep < lastStep ? (
            <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className="rounded-2xl"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={reduceMotion || isPlacingOrder ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
              <Button
                type="button"
                onClick={handleBuy}
                disabled={isPlacingOrder}
                className="rounded-2xl"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing…
                  </>
                ) : (
                  <>
                    Place order <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardFooter>

        {formError ? (
          <p className="px-6 pb-4 text-center text-xs font-semibold text-red-600">{formError}</p>
        ) : null}
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Step {currentStep + 1} of {CHECKOUT_STEPS.length}: {CHECKOUT_STEPS[currentStep].title}
      </p>
    </div>
  );
}
