"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { PageShell } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";

const LOCAL_ORDERS_KEY = "freelance-1.local.orders.v1";

interface OrderItem {
  id: string | number;
  productId: string | number;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
  color?: string | null;
  size?: string | null;
  lineTotal: number;
}

interface OrderRow {
  id: string | number;
  created_at: string;
  customer_email: string | null;
  customer_name?: string | null;
  customer_phone: string | null;
  customer_phone_alt?: string | null;
  customer_dob?: string | null;
  location_mode?: "current" | "manual" | null;
  location_manual?: string | null;
  location_coords?: string | null;
  payment_method?: string | null;
  currency: string | null;
  status: string | null;
  subtotal: number | null;
  shipping: number | null;
  total: number | null;
  items: {
    items: OrderItem[];
    customer?: any;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
  } | OrderItem[] | any;
}

export default function OrdersPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  
  const [loading, setLoading] = React.useState(true);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = React.useState<Record<string | number, boolean>>({});

  // Set page title and fetch orders
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "My Orders | Sawbhagya";
    }

    const init = async () => {
      setCheckingAuth(true);
      setError(null);

      if (!supabaseEnabled) {
        // Local mode: retrieve from localStorage
        setUserEmail(null);
        setCheckingAuth(false);
        try {
          const raw = window.localStorage.getItem(LOCAL_ORDERS_KEY);
          const parsed = raw ? (JSON.parse(raw) as OrderRow[]) : [];
          const sorted = (Array.isArray(parsed) ? parsed : []).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setOrders(sorted);
        } catch (err: any) {
          setError("Failed to retrieve your local orders.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // Supabase mode
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Redirect to sign in page
          router.replace("/sign-in?to=orders");
          return;
        }

        setUserEmail(user.email ?? null);
        setCheckingAuth(false);

        // Fetch orders by user email
        const { data, error: dbError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", user.email)
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;
        setOrders((data ?? []) as OrderRow[]);
      } catch (err: any) {
        console.error("Error loading orders:", err);
        setError(err.message || "Something went wrong while loading your orders.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const toggleExpand = (id: string | number) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatINR = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string | null) => {
    const s = String(status || "").toLowerCase();
    if (s === "paid" || s === "completed" || s === "success") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (s === "pending" || s === "processing") {
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
    if (s === "cancelled" || s === "failed") {
      return "bg-red-50 text-red-700 border-red-200/60";
    }
    if (s === "shipped" || s === "delivered") {
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    }
    return "bg-zinc-50 text-zinc-600 border-zinc-200";
  };

  const parseOrderItems = (order: OrderRow): OrderItem[] => {
    if (!order.items) return [];
    if (Array.isArray(order.items)) return order.items;
    if (Array.isArray(order.items.items)) return order.items.items;
    return [];
  };

  // Rendering States
  if (loading || checkingAuth) {
    return (
      <PageShell 
        eyebrow="Account" 
        title="My Orders" 
        subtitle="Manage and track your recent orders"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-neutral-500" />
          <p className="mt-4 text-sm font-medium text-neutral-600">Loading your orders history...</p>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell 
        eyebrow="Account" 
        title="My Orders" 
        subtitle="Manage and track your recent orders"
      >
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
          <h3 className="mt-3 text-sm font-semibold text-red-800">Error loading orders</h3>
          <p className="mt-1 text-xs text-red-600">{error}</p>
          <Button 
            className="mt-4 rounded-full" 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      eyebrow="Account" 
      title="My Orders" 
      subtitle={userEmail ? `Signed in as ${userEmail}` : "Review your local order details"}
    >
      {orders.length === 0 ? (
        <motion.div 
          className="rounded-3xl border border-dashed border-black/20 bg-white/50 p-12 text-center"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <ShoppingBag className="mx-auto h-12 w-12 text-neutral-400" aria-hidden />
          <p className="mt-4 text-base font-semibold text-neutral-900">No orders found.</p>
          <p className="mt-1 text-xs text-neutral-600">
            You haven't placed any orders yet. Browse our collection to find something you love.
          </p>
          <Button className="mt-6 rounded-full" onClick={() => router.push("/#shop")}>
            Start Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order, orderIdx) => {
              const isExpanded = expandedOrders[order.id];
              const orderItems = parseOrderItems(order);
              
              return (
                <motion.div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                  initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: Math.min(orderIdx * 0.05, 0.3) }}
                >
                  {/* Order Card Header */}
                  <div className="border-b border-zinc-100 bg-zinc-50/50 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Order ID</p>
                          <p className="mt-0.5 text-xs font-mono font-medium text-zinc-900">
                            #{String(order.id).slice(-12)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Placed On</p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total</p>
                          <p className="mt-0.5 text-xs font-bold text-zinc-950">
                            {formatINR(order.total ?? 0)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {String(order.status || "pending").toUpperCase()}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => toggleExpand(order.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                          aria-label={isExpanded ? "Collapse items" : "Expand items"}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Delivery and Payment Summary */}
                      <div className="grid gap-6 border-b border-zinc-100 pb-5 md:grid-cols-2">
                        <div>
                          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800">
                            <MapPin className="h-4 w-4 text-zinc-400" />
                            Delivery Address
                          </h4>
                          <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                            {order.location_manual || "No delivery address specified."}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800">
                            <CreditCard className="h-4 w-4 text-zinc-400" />
                            Payment Details
                          </h4>
                          <div className="mt-2 space-y-1 text-xs text-zinc-600">
                            <p>
                              Method: <span className="font-medium text-zinc-800 capitalize">{order.payment_method || "COD"}</span>
                            </p>
                            {order.items?.razorpay_payment_id && (
                              <p className="font-mono text-[10px] text-zinc-500">
                                Payment ID: {order.items.razorpay_payment_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items Preview/List */}
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800">
                            <Package className="h-4 w-4 text-zinc-400" />
                            Items ({orderItems.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => toggleExpand(order.id)}
                            className="text-xs font-medium text-zinc-800 hover:underline"
                          >
                            {isExpanded ? "Collapse Details" : "View Details"}
                          </button>
                        </div>

                        <div className="mt-3 divide-y divide-zinc-100">
                          {/* Mini Preview when collapsed (Shows images and item titles briefly) */}
                          {!isExpanded && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {orderItems.map((item, idx) => (
                                <div 
                                  key={item.id || idx}
                                  className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 p-1.5 pr-2.5"
                                >
                                  {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      src={item.image} 
                                      alt="" 
                                      className="h-8 w-8 rounded object-cover" 
                                    />
                                  ) : (
                                    <div className="grid h-8 w-8 place-items-center rounded bg-zinc-200 text-[10px] font-bold text-zinc-500">
                                      {item.name?.[0]?.toUpperCase() || "I"}
                                    </div>
                                  )}
                                  <span className="max-w-[120px] truncate text-[11px] font-medium text-zinc-700">
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] font-semibold text-zinc-400">
                                    × {item.qty}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Detailed list when expanded */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                className="space-y-4 overflow-hidden pt-2"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {orderItems.map((item, idx) => (
                                  <div 
                                    key={item.id || idx} 
                                    className="flex items-center justify-between py-3 first:pt-0"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-100">
                                        {item.image ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="grid h-full w-full place-items-center bg-zinc-100 text-xs font-bold text-zinc-500">
                                            {item.name?.[0]?.toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div>
                                        <h5 className="text-xs font-semibold text-zinc-800 sm:text-sm">
                                          {item.name}
                                        </h5>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-zinc-500 sm:text-xs">
                                          {item.color && (
                                            <span className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                                              Color: {item.color}
                                            </span>
                                          )}
                                          {item.size && (
                                            <span className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                                              Size: {item.size}
                                            </span>
                                          )}
                                          <span>Qty: {item.qty}</span>
                                          <span>× {formatINR(item.price)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <p className="text-xs font-bold text-zinc-900">
                                        {formatINR(item.qty * item.price)}
                                      </p>
                                    </div>
                                  </div>
                                ))}

                                {/* Order Summary Footer Details */}
                                <div className="mt-4 rounded-xl bg-zinc-50/50 p-4 space-y-1.5 text-xs text-zinc-600 border border-zinc-100">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatINR(order.subtotal ?? (order.total ?? 0) - (order.shipping ?? 0))}</span>
                                  </div>
                                  {(() => {
                                    let parsedItems = order.items;
                                    if (typeof parsedItems === "string") {
                                      try {
                                        parsedItems = JSON.parse(parsedItems);
                                      } catch {
                                        parsedItems = null;
                                      }
                                    }
                                    const coupon = parsedItems?.coupon || null;
                                    if (!coupon) return null;
                                    return (
                                      <div className="flex justify-between text-emerald-600 font-semibold font-sans">
                                        <span>Discount ({coupon.code})</span>
                                        <span>− {formatINR(coupon.discount)}</span>
                                      </div>
                                    );
                                  })()}
                                  <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping ?? 0)}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-zinc-200/80 pt-2 font-bold text-zinc-900">
                                    <span>Total</span>
                                    <span>{formatINR(order.total ?? 0)}</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </PageShell>
  );
}
