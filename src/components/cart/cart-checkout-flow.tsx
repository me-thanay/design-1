"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, ShoppingBag, ShieldCheck, Truck, Lock, CreditCard } from "lucide-react";
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

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [altPhone, setAltPhone] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [locationMode] = React.useState<"manual">("manual");
  const [manualLocation, setManualLocation] = React.useState("");
  const [locationStatus] = React.useState<string | null>(null);
  const [paymentMethod] = React.useState<"razorpay">("razorpay");
  const [formError, setFormError] = React.useState<string | null>(null);

  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [authChecking, setAuthChecking] = React.useState(true);

  React.useEffect(() => {
    loadRazorpayScript();

    if (!supabaseEnabled) {
      setAuthChecking(false);
      return;
    }

    let cancelled = false;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!cancelled) {
          setCurrentUser(data?.session?.user ?? null);
          setAuthChecking(false);
        }
      } catch {
        if (!cancelled) setAuthChecking(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!cancelled) {
        setCurrentUser(session?.user ?? null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const lastStep = CHECKOUT_STEPS.length - 1;
  const progress =
    lastStep <= 0 ? 0 : Math.round((currentStep / lastStep) * 100);

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return !isEmpty;
      case 1:
        return fullName.trim() !== "" && phone.trim() !== "";
      case 2:
        return manualLocation.trim() !== "";
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

  const saveOrder = async (payload: any) => {
    type OrderInsertRow = Record<string, unknown>;
    if (!supabaseEnabled) {
      const prevRaw = window.localStorage.getItem(LOCAL_ORDERS_KEY);
      let prev: unknown[] = [];
      try {
        prev = prevRaw ? (JSON.parse(prevRaw) as unknown[]) : [];
      } catch {
        prev = [];
      }
      const order = { id: Date.now(), created_at: new Date().toISOString(), ...payload };
      window.localStorage.setItem(
        LOCAL_ORDERS_KEY,
        JSON.stringify([order, ...(Array.isArray(prev) ? prev : [])]),
      );
    } else {
      let res = await supabase.from("orders").insert(payload as unknown as OrderInsertRow);
      if (res.error && /Could not find the 'customer_name' column|Could not find the 'customer_phone_alt' column|Could not find the 'customer_dob' column/i.test(res.error.message ?? "")) {
        const minimal = {
          customer_email: payload.customer_email,
          customer_phone: payload.customer_phone,
          location_mode: payload.location_mode,
          location_manual: payload.location_manual,
          location_coords: payload.location_coords,
          payment_method: payload.payment_method,
          currency: payload.currency,
          status: payload.status,
          subtotal: payload.subtotal,
          shipping: payload.shipping,
          total: payload.total,
          items: payload.items,
        };
        res = await supabase.from("orders").insert(minimal as unknown as OrderInsertRow);
      }
      if (res.error) throw res.error;
    }

    try {
      const enabled = process.env.NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS === "true";
      if (!enabled) throw new Error("disabled");

      const adminTo = process.env.NEXT_PUBLIC_CREATOR_EMAIL ?? "";
      const itemLines = items
        .map((i) => {
          const extra =
            (i as any).color || (i as any).size
              ? ` (${[(i as any).color ? `Color: ${(i as any).color}` : null, (i as any).size ? `Size: ${(i as any).size}` : null].filter(Boolean).join(", ")})`
              : "";
          return `- ${i.name}${extra} × ${i.qty} = ${formatINR(i.price * i.qty)}`;
        })
        .join("\n");

      const text = [
        `New order placed (${payload.status === "paid" ? "Paid via Razorpay" : "Pending confirmation"})`,
        "",
        `Name: ${fullName.trim()}`,
        `Phone: ${phone.trim()}`,
        altPhone.trim() ? `Alternate: ${altPhone.trim()}` : null,
        dob.trim() ? `DOB: ${dob.trim()}` : null,
        "",
        `Delivery: ${manualLocation.trim()}`,
        "",
        "Items:",
        itemLines,
        "",
        `Total: ${formatINR(total)}`,
      ]
        .filter(Boolean)
        .join("\n");

      const customerEmail = payload.customer_email;
      const toList = [
        ...(customerEmail ? [customerEmail] : []),
        ...adminTo
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean),
      ];

      if (toList.length) {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            to: toList,
            subject: `Sawbhagya order · ${fullName.trim()}`,
            text,
          }),
        });
      }
    } catch {
      // ignore email failures
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
    if (!fullName.trim()) {
      const msg = "Please enter your name.";
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
        customer_name: fullName.trim(),
        customer_phone_alt: altPhone.trim() || null,
        customer_dob: dob.trim() || null,
        location_mode: locationMode,
        location_manual: manualLocation.trim(),
        location_coords: null,
        payment_method: paymentMethod,
        currency: "INR",
        status: paymentMethod === "razorpay" ? "paid" : "pending",
        subtotal,
        shipping,
        total,
        items: {
          customer: {
            name: fullName.trim(),
            phone: phone.trim(),
            altPhone: altPhone.trim() || null,
            dob: dob.trim() || null,
          },
          items: items.map((i) => ({
            id: i.id,
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            image: i.image ?? null,
            color: i.color ?? null,
            size: i.size ?? null,
            lineTotal: i.price * i.qty,
          })),
        },
      };

      if (paymentMethod === "razorpay") {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }

        const orderRes = await fetch("/api/checkout/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        });

        if (!orderRes.ok) {
          const errData = await orderRes.json();
          throw new Error(errData.error || "Failed to create payment order.");
        }

        const razorpayOrder = await orderRes.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Sawbhagya",
          description: "Order Payment",
          order_id: razorpayOrder.id,
          prefill: {
            name: fullName.trim(),
            contact: phone.trim(),
            email: customerEmail || "",
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: () => {
              setIsPlacingOrder(false);
              toast.error("Payment was cancelled.");
            },
          },
          handler: async (response: any) => {
            setIsPlacingOrder(true);
            try {
              const verifyRes = await fetch("/api/checkout/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                throw new Error(errData.error || "Payment signature verification failed.");
              }

              const finalPayload = {
                ...payload,
                items: {
                  ...payload.items,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                },
              };

              await saveOrder(finalPayload);
              clear();
              toast.success("Order placed successfully! Payment verified.");
              router.push("/");
            } catch (err: any) {
              toast.error(err.message || "Failed to verify payment.");
            } finally {
              setIsPlacingOrder(false);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        await saveOrder(payload);
        clear();
        toast.success("Order placed! We’ll contact you shortly to confirm.");
        router.push("/");
      }
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
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 line-clamp-2">
                              {item.name}
                            </p>
                            {(item.color || item.size) ? (
                              <p className="mt-1 text-[11px] font-medium text-neutral-600">
                                {item.color ? `Color: ${item.color}` : null}
                                {item.color && item.size ? " · " : null}
                                {item.size ? `Size: ${item.size}` : null}
                              </p>
                            ) : null}
                          </div>
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
                  {!currentUser && !authChecking && (
                    <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 text-center text-xs text-zinc-650 font-medium font-sans">
                      Please log in with Google to continue and place your order.
                    </div>
                  )}
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
                    <Label htmlFor="cart-name">Full name</Label>
                    <Input
                      id="cart-name"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cart-phone">Phone number</Label>
                    <Input
                      id="cart-phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cart-alt-phone">Alternate number (optional)</Label>
                    <Input
                      id="cart-alt-phone"
                      type="tel"
                      placeholder="+91 90000 00000"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cart-dob">Date of birth (optional)</Label>
                    <Input
                      id="cart-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
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
                  {locationStatus ? (
                    <p className="text-xs text-neutral-600">{locationStatus}</p>
                  ) : null}
                </CardContent>
              </>
            )}

            {currentStep === 3 && (
              <>
                <CardHeader className="pb-3 font-sans">
                  <CardTitle className="text-lg font-bold tracking-tight font-sans">Payment Method</CardTitle>
                  <CardDescription className="font-sans">All payments are securely processed and encrypted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 font-sans">
                  <div className="relative overflow-hidden rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-neutral-50 to-neutral-100 p-5 shadow-sm dark:from-neutral-900 dark:to-neutral-950 font-sans">
                    <div className="flex items-start justify-between gap-4 font-sans">
                      <div className="space-y-1.5 font-sans">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-sans">
                          🔒 Secure Gateway
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-sans">
                          Online Payment via Razorpay
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                          Pay instantly using any UPI App (GPay, PhonePe, Paytm), Credit/Debit Cards, Netbanking, or popular wallets.
                        </p>
                      </div>
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    </div>

                    <div className="mt-5 border-t border-neutral-200/60 pt-4 dark:border-neutral-800 font-sans">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 font-sans">
                        Accepted Methods
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 grayscale opacity-80 transition hover:grayscale-0 hover:opacity-100 duration-300 font-sans">
                        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 font-sans">
                          <CreditCard className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Cards</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 font-sans">
                          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 font-sans">UPI</span>
                          <span>UPI / QR</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 font-sans">
                          <span>Net Banking</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 font-sans">
                          <span>Wallets</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4 text-xs text-primary dark:bg-primary/10 font-sans">
                    <ShieldCheck className="h-5 w-5 shrink-0 stroke-[2]" />
                    <p className="leading-relaxed font-sans">
                      Payment details are encrypted using SSL protocol. We do not store or see your card/payment credentials.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 4 && (
              <>
                <CardHeader className="pb-3 font-sans">
                  <CardTitle className="text-lg font-bold tracking-tight font-sans">Order Summary</CardTitle>
                  <CardDescription className="font-sans">Review your items and shipping details before completing payment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm font-sans">
                  {/* Items list with images */}
                  <div className="space-y-2.5 font-sans">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-455 text-muted-foreground font-sans">
                      Bag Items ({itemCount})
                    </p>
                    <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 font-sans">
                      {items.map((i) => (
                        <div key={i.id} className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white/50 p-2 dark:border-neutral-800 dark:bg-black/20 font-sans">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-black/5 dark:bg-neutral-900 font-sans">
                            {i.image ? (
                              <img
                                src={i.image}
                                alt={i.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs font-semibold text-neutral-450 dark:bg-neutral-950 font-sans">
                                SA
                              </div>
                            )}
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white shadow-sm ring-1 ring-white font-sans">
                              {i.qty}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 font-sans">
                            <h5 className="truncate text-xs font-bold text-neutral-900 dark:text-white font-sans">
                              {i.name}
                            </h5>
                            <p className="mt-0.5 text-[10px] text-neutral-500 font-sans">
                              {[i.color ? `Color: ${i.color}` : null, i.size ? `Size: ${i.size}` : null]
                                .filter(Boolean)
                                .join(" · ") || "Standard variation"}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-neutral-900 dark:text-white shrink-0 font-sans">
                            {formatINR(i.price * i.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer details & address summary */}
                  <div className="grid gap-2 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3.5 text-xs text-neutral-700 dark:border-neutral-850 dark:bg-neutral-950/40 dark:text-neutral-300 font-sans">
                    <div className="flex justify-between font-sans">
                      <span className="text-neutral-500 font-sans">Recipient Name</span>
                      <span className="font-semibold text-neutral-900 dark:text-white font-sans">{fullName || "—"}</span>
                    </div>
                    <div className="flex justify-between font-sans">
                      <span className="text-neutral-500 font-sans">Contact Number</span>
                      <span className="font-semibold text-neutral-900 dark:text-white font-sans">{phone || "—"}</span>
                    </div>
                    <div className="flex justify-between gap-4 font-sans">
                      <span className="text-neutral-500 shrink-0 font-sans">Delivery Address</span>
                      <span className="text-right font-medium text-neutral-900 dark:text-white line-clamp-2 font-sans">
                        {manualLocation || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200/60 pt-2 dark:border-neutral-800 font-sans">
                      <span className="text-neutral-500 font-sans">Payment Gateway</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-white font-sans">
                        <Lock className="h-3 w-3 text-emerald-600" /> Razorpay Secured
                      </span>
                    </div>
                  </div>

                  {/* Cost breakdown - designed to be highly appealing */}
                  <div className="rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 dark:from-neutral-900 dark:to-neutral-950 ring-1 ring-black/[0.04] font-sans">
                    <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-sans">
                      <div className="flex justify-between font-sans">
                        <span>Items Subtotal</span>
                        <span className="font-semibold text-neutral-900 dark:text-white font-sans">{formatINR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center font-sans">
                        <span className="flex items-center gap-1 font-sans">
                          Shipping & Handling
                          <span className="rounded bg-emerald-50 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-sans">
                            Free Shipping
                          </span>
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">FREE</span>
                      </div>
                      <div className="flex justify-between font-sans">
                        <span>GST / Estimated Tax</span>
                        <span className="font-medium text-neutral-400 font-sans">Included</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 border-t border-neutral-200/60 pt-2.5 flex justify-between items-baseline dark:border-neutral-800 font-sans">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white font-sans">Total Amount</span>
                      <span className="text-lg font-extrabold text-neutral-950 dark:text-white tracking-tight font-sans">
                        {formatINR(total)}
                      </span>
                    </div>
                  </div>

                  {/* conversion features / psychological cues */}
                  <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800 font-sans">
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-sans">
                      <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Delivery in 3–5 Days</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-sans">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Verified SSL Checkout</span>
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
            <motion.div whileHover={reduceMotion || authChecking ? undefined : { scale: 1.03 }} whileTap={reduceMotion || authChecking ? undefined : { scale: 0.97 }}>
              {currentStep === 0 && !currentUser && !authChecking ? (
                <Button
                  type="button"
                  onClick={() => router.push("/sign-in?to=cart")}
                  className="rounded-2xl bg-zinc-950 text-white hover:bg-zinc-850"
                >
                  Login to Checkout
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={authChecking || !isStepValid()}
                  className="rounded-2xl"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              )}
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
