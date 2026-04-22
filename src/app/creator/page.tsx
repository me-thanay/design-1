"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";
import { PageShell } from "@/components/ui/page-shell";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import {
  CLOTHING_CATEGORIES,
  CLOTHING_SUBCATEGORIES as SUBCATEGORIES,
  normalizeSubcategory,
  type ClothingCategory,
} from "@/lib/products";

const LOCAL_CLOTHES_KEY = "freelance-1.local.clothes.v1";
const LOCAL_ORDERS_KEY = "freelance-1.local.orders.v1";

type ClothingItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean;
  category?: ClothingCategory;
  subcategory?: string;
  rating?: number;
};

function normalizeRating(value?: number | string | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 4;
  return Math.min(5, Math.max(1, Number(n.toFixed(1))));
}

function inferCategoryFromText(text: string | null | undefined) {
  const t = (text ?? "").toLowerCase();
  if (t.includes("saree")) return "sarees";
  if (t.includes("kurti")) return "kurtis";
  if (t.includes("blouse")) return "blouses";
  if (t.includes("gown")) return "gowns";
  return "sarees";
}

function stripCategoryPrefix(description: string | null | undefined) {
  if (!description) return null;
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  if (withMeta) {
    const cleanedMeta = withMeta[4]?.trim();
    return cleanedMeta ? cleanedMeta : null;
  }
  const match = description.match(
    /^__category__:(sarees|kurtis|blouses|gowns)__([\s\S]*)$/i,
  );
  if (!match) return description;
  const cleaned = match[2]?.trim();
  return cleaned ? cleaned : null;
}

function decodeCategory(description: string | null | undefined) {
  if (!description) return "sarees";
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  if (withMeta) return withMeta[1].toLowerCase() as ClothingCategory;
  const match = description.match(
    /^__category__:(sarees|kurtis|blouses|gowns)__/i,
  );
  if (!match) return inferCategoryFromText(description);
  return match[1].toLowerCase() as ClothingCategory;
}

function encodeCategoryPrefix(
  description: string | null | undefined,
  category: ClothingCategory,
  subcategory: string,
  rating: number,
) {
  const cleaned = (description ?? "").trim();
  const safeSubcategory = normalizeSubcategory(category, subcategory);
  const safeRating = normalizeRating(rating);
  return `__meta__:${category}|${safeSubcategory}|${safeRating}__${cleaned}`;
}

function decodeSubcategory(
  description: string | null | undefined,
  category: ClothingCategory,
) {
  if (!description) return SUBCATEGORIES[category][0];
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  if (withMeta) return normalizeSubcategory(category, withMeta[2]);

  const t = description.toLowerCase();
  const found = SUBCATEGORIES[category].find((s) => t.includes(s.toLowerCase()));
  return found ?? SUBCATEGORIES[category][0];
}

function decodeRating(description: string | null | undefined) {
  if (!description) return 4;
  const withMeta = description.match(
    /^__meta__:(sarees|kurtis|blouses|gowns)\|([^|_]+)(?:\|([0-9.]+))?__([\s\S]*)$/i,
  );
  if (withMeta?.[3]) return normalizeRating(withMeta[3]);
  return 4;
}

function normalizeClothingItem(raw: any): ClothingItem {
  const rawDescription: string | null = raw?.description ?? null;
  const cleanedDescription = stripCategoryPrefix(rawDescription);
  const category = raw?.category ?? decodeCategory(rawDescription);
  const subcategory = normalizeSubcategory(
    category,
    raw?.subcategory ?? decodeSubcategory(rawDescription, category),
  );
  const rating = normalizeRating(raw?.rating ?? decodeRating(rawDescription));
  return {
    ...raw,
    description: cleanedDescription,
    category,
    subcategory,
    rating,
  } as ClothingItem;
}

type OrderRow = {
  id: string | number;
  created_at: string;
  customer_email: string | null;
  customer_phone: string | null;
  location_mode?: "current" | "manual" | null;
  location_manual?: string | null;
  location_coords?: string | null;
  payment_method?: "cod" | "upi" | "card" | string | null;
  currency: string | null;
  status: string | null;
  subtotal: number | null;
  shipping: number | null;
  total: number | null;
  items: any;
};

function formatPaymentMethod(method?: OrderRow["payment_method"]) {
  const v = method?.toLowerCase?.() ?? "";
  if (!v) return "—";
  if (v === "cod") return "Cash on delivery";
  if (v === "upi") return "UPI";
  if (v === "card") return "Card";
  // Fallback for any custom/string payment value
  return String(method);
}

function parseOrderItems(items: any): Array<any> {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore parse errors and fall back to empty list
    }
  }
  // Some JSONB drivers may return objects instead of arrays.
  if (typeof items === "object") {
    const maybeInner = (items as any)?.items;
    if (Array.isArray(maybeInner)) return maybeInner;

    // Handle objects with numeric keys (e.g. {"0": {...}, "1": {...}})
    const keys = Object.keys(items);
    const numericKeys = keys
      .filter((k) => String(Number(k)) === k)
      .sort((a, b) => Number(a) - Number(b));
    if (numericKeys.length) {
      return numericKeys.map((k) => (items as any)[k]);
    }
  }
  return [];
}

export default function CreatorPage() {
  const router = useRouter();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [authState, setAuthState] = useState<
    "checking" | "authorized" | "unauthorized"
  >("checking");
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [categoryFilter, setCategoryFilter] =
    useState<ClothingCategory>("sarees");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "sarees" as ClothingCategory,
    subcategory: SUBCATEGORIES.sarees[0],
    rating: "4",
    image_url: "",
    in_stock: true,
  });
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreviewUrl, setFormImagePreviewUrl] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClothingItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "sarees" as ClothingCategory,
    subcategory: SUBCATEGORIES.sarees[0],
    rating: "4",
    image_url: "",
    in_stock: true,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [
    editImagePreviewUrl,
    setEditImagePreviewUrl,
  ] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (formImagePreviewUrl) URL.revokeObjectURL(formImagePreviewUrl);
    };
  }, [formImagePreviewUrl]);

  useEffect(() => {
    return () => {
      if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    };
  }, [editImagePreviewUrl]);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      setAuthState("checking");
      if (!supabaseEnabled) {
        // Never allow "local creator mode" in production deployments.
        const isDev = process.env.NODE_ENV !== "production";
        if (!isDev) {
          setAuthState("unauthorized");
          router.replace("/sign-in?to=creator");
          return;
        }

        const localOk =
          window.localStorage.getItem("freelance-1.creator.local") === "true";
        if (!localOk) {
          setAuthState("unauthorized");
          router.replace("/sign-in?to=creator");
          return;
        }

        setCurrentUserEmail("Local creator (Supabase off)");
        setAuthState("authorized");
        await loadItems();
        return;
      }

      // Avoid hanging forever if Supabase auth/network is blocked.
      const authRes = (await Promise.race([
        supabase.auth.getUser(),
        new Promise<{ data: { user: null }; error: { message: string } }>((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: { user: null },
                error: { message: "Timed out checking auth. Check your Supabase env vars / network." },
              }),
            9000,
          ),
        ),
      ])) as { data: { user: any | null }; error: { message: string } | null };

      if (authRes.error) {
        setAuthState("authorized");
        setError(authRes.error.message);
        setCurrentUserEmail(null);
        setLoading(false);
        return;
      }

      const user = authRes.data.user;

      if (!user) {
        setAuthState("unauthorized");
        router.replace("/sign-in?to=creator");
        return;
      }

      setCurrentUserEmail(user.email ?? null);

      const allowedEmailsRaw = process.env.NEXT_PUBLIC_CREATOR_EMAIL ?? "";
      const allowedEmails = allowedEmailsRaw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = (user.email ?? "").toLowerCase();

      // Only allow emails listed in NEXT_PUBLIC_CREATOR_EMAIL (comma-separated).
      if (allowedEmails.length === 0) {
        await supabase.auth.signOut();
        setAuthState("unauthorized");
        router.replace("/sign-in?to=creator");
        return;
      }

      if (!allowedEmails.includes(userEmail)) {
        await supabase.auth.signOut();
        setAuthState("unauthorized");
        router.replace("/sign-in?to=creator");
        return;
      }

      setAuthState("authorized");
      await loadItems();
    };

    checkAuthAndLoad();
  }, [router]);

  if (authState === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-center text-xl font-semibold text-zinc-900">
            Checking access…
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Please wait while we verify your admin account.
          </p>
        </div>
      </div>
    );
  }

  if (authState === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-center text-xl font-semibold text-zinc-900">
            Access denied
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-600">
            You don’t have permission to view the creator dashboard.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/sign-in?to=creator")}
            className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  const readLocalClothes = () => {
    try {
      const raw = window.localStorage.getItem(LOCAL_CLOTHES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ClothingItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((it) => normalizeClothingItem(it));
    } catch {
      return [];
    }
  };

  const writeLocalClothes = (next: ClothingItem[]) => {
    window.localStorage.setItem(LOCAL_CLOTHES_KEY, JSON.stringify(next));
  };

  const readLocalOrders = () => {
    try {
      const raw = window.localStorage.getItem(LOCAL_ORDERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as OrderRow[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const loadItems = async () => {
    setLoading(true);
    setError(null);

    if (!supabaseEnabled) {
      const local = readLocalClothes().sort((a, b) => b.id - a.id);
      setItems(local);
      setLoading(false);
      return;
    }
    try {
      // Avoid getting stuck forever on bad network/RLS; surface a useful error instead.
      const res = (await Promise.race([
        supabase.from("clothes").select("*").order("created_at", { ascending: false }),
        new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: null,
                error: { message: "Timed out loading items. Check your Supabase connection / RLS policies." },
              }),
            9000,
          ),
        ),
      ])) as { data: any[] | null; error: { message: string } | null };

      if (res.error) {
        setError(res.error.message);
        setItems([]);
        return;
      }

      const normalized = ((res.data ?? []) as any[]).map((it) => normalizeClothingItem(it));
      setItems(normalized);

      // Keep local cache in sync so old deleted items won't reappear if the app falls back to local mode.
      try {
        writeLocalClothes(normalized);
      } catch {
        // ignore
      }
    } catch (e: any) {
      setError(e?.message ?? "Could not load items.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Last-resort watchdog: never leave the UI in an infinite loading state.
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => {
      setLoading(false);
      setError((prev) =>
        prev ??
        "Still loading items. This usually means Supabase read access (RLS) is blocking the query or the network is failing. Click Reload.",
      );
    }, 12000);
    return () => window.clearTimeout(t);
  }, [loading]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = e.target;
    const isCheckbox = target.type === "checkbox";
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? target.checked : value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = e.target;
    const isCheckbox = target.type === "checkbox";
    setEditForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? target.checked : value,
    }));
  };

  const readFileAsDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });
  };

  const uploadImageToStorage = async (file: File) => {
    const bucketName = "clothes";

    const safeExt =
      (file.name.split(".").pop() ?? "").trim() || "jpg";
    const filePath = `creator-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}-${file.name}`.replace(/\s+/g, "-");

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || `image/${safeExt}`,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error("Could not get public image URL.");
    return data.publicUrl;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const priceNumber = Number(form.price);
      if (Number.isNaN(priceNumber)) {
        setError("Price must be a number");
        return;
      }
      const ratingNumber = normalizeRating(form.rating);

      let imageUrl: string | null = null;
      if (formImageFile) {
        imageUrl = supabaseEnabled
          ? await uploadImageToStorage(formImageFile)
          : await readFileAsDataUrl(formImageFile);
      }

      if (!supabaseEnabled) {
        const prev = readLocalClothes();
        const nextId = prev.length
          ? Math.max(...prev.map((p) => p.id)) + 1
          : 1;
        const nextItem: ClothingItem = {
          id: nextId,
          name: form.name,
          description: encodeCategoryPrefix(
            form.description || null,
            form.category,
            form.subcategory,
            ratingNumber,
          ),
          price: priceNumber,
          image_url: imageUrl,
          in_stock: form.in_stock,
          category: form.category,
          subcategory: form.subcategory,
          rating: ratingNumber,
        };
        const next = [nextItem, ...prev];
        writeLocalClothes(next);
        setItems(next.map((it) => normalizeClothingItem(it)));
        setForm({
          name: "",
          description: "",
          price: "",
          category: categoryFilter,
          subcategory: SUBCATEGORIES[categoryFilter][0],
          rating: "4",
          image_url: "",
          in_stock: true,
        });
        setFormImageFile(null);
        setFormImagePreviewUrl(null);
        return;
      }

      const { error } = await supabase.from("clothes").insert({
        name: form.name,
        description: encodeCategoryPrefix(
          form.description || null,
          form.category,
          form.subcategory,
          ratingNumber,
        ),
        price: priceNumber,
        image_url: imageUrl,
        in_stock: form.in_stock,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category: categoryFilter,
        subcategory: SUBCATEGORIES[categoryFilter][0],
        rating: "4",
        image_url: "",
        in_stock: true,
      });
      await loadItems();
      setFormImageFile(null);
      setFormImagePreviewUrl(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not save item");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: ClothingItem) => {
    setEditing(item);
    setEditImageFile(null);
    setEditImagePreviewUrl(null);
    setEditForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price.toString(),
      image_url: item.image_url ?? "",
      in_stock: item.in_stock,
      category: item.category ?? decodeCategory(item.description),
      subcategory:
        item.subcategory ??
        decodeSubcategory(
          item.description,
          item.category ?? decodeCategory(item.description),
        ),
      rating: String(normalizeRating(item.rating ?? decodeRating(item.description))),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const priceNumber = Number(editForm.price);
      if (Number.isNaN(priceNumber)) {
        setError("Price must be a number");
        return;
      }
      const ratingNumber = normalizeRating(editForm.rating);

      let nextImageUrl: string | null = editForm.image_url || null;
      if (editImageFile) {
        nextImageUrl = supabaseEnabled
          ? await uploadImageToStorage(editImageFile)
          : await readFileAsDataUrl(editImageFile);
      }

      if (!supabaseEnabled) {
        const prev = readLocalClothes();
        const next = prev.map((it) =>
          it.id === editing.id
            ? {
                ...it,
                name: editForm.name,
                description: encodeCategoryPrefix(
                  editForm.description || null,
                  editForm.category,
                  editForm.subcategory,
                  ratingNumber,
                ),
                price: priceNumber,
                image_url: nextImageUrl,
                in_stock: editForm.in_stock,
                category: editForm.category,
                subcategory: editForm.subcategory,
                rating: ratingNumber,
              }
            : it,
        );
        writeLocalClothes(next);
        setItems(next.map((it) => normalizeClothingItem(it)));
        setEditing(null);
        return;
      }

      const { error } = await supabase
        .from("clothes")
        .update({
          name: editForm.name,
          description: encodeCategoryPrefix(
            editForm.description || null,
            editForm.category,
            editForm.subcategory,
            ratingNumber,
          ),
          price: priceNumber,
          image_url: nextImageUrl,
          in_stock: editForm.in_stock,
        })
        .eq("id", editing.id);

      if (error) {
        setError(error.message);
        return;
      }

      setEditing(null);
      await loadItems();
    } catch (err: any) {
      setError(err?.message ?? "Could not update item");
    } finally {
      setEditImageFile(null);
      setEditImagePreviewUrl(null);
      setSaving(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    if (!supabaseEnabled) {
      const local = readLocalOrders().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setOrders(local);
      setOrdersLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setOrdersError(error.message);
      setOrders([]);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setOrdersLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!supabaseEnabled) {
      const prev = readLocalClothes();
      const next = prev.filter((it) => it.id !== id);
      writeLocalClothes(next);
      setItems(next);
      return;
    }
    const { error } = await supabase.from("clothes").delete().eq("id", id);
    if (error) {
      setError(error.message);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      // Also purge any stale local cache so deleted items don't reappear if the app
      // falls back to local mode (missing env vars / offline).
      try {
        const prevLocal = readLocalClothes();
        if (prevLocal.length) {
          const nextLocal = prevLocal.filter((it) => it.id !== id);
          if (nextLocal.length !== prevLocal.length) writeLocalClothes(nextLocal);
        }
      } catch {
        // ignore
      }
    }
  };

  const handleToggleStock = async (item: ClothingItem) => {
    if (!supabaseEnabled) {
      const prev = readLocalClothes();
      const next = prev.map((it) =>
        it.id === item.id ? { ...it, in_stock: !it.in_stock } : it,
      );
      writeLocalClothes(next);
      setItems(next);
      return;
    }
    const { error } = await supabase
      .from("clothes")
      .update({ in_stock: !item.in_stock })
      .eq("id", item.id);
    if (error) {
      setError(error.message);
    } else {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, in_stock: !it.in_stock } : it,
        ),
      );
    }
  };

  const handlePriceChange = async (item: ClothingItem, newPrice: number) => {
    if (!supabaseEnabled) {
      const prev = readLocalClothes();
      const next = prev.map((it) =>
        it.id === item.id ? { ...it, price: newPrice } : it,
      );
      writeLocalClothes(next);
      setItems(next);
      return;
    }
    const { error } = await supabase
      .from("clothes")
      .update({ price: newPrice })
      .eq("id", item.id);
    if (error) {
      setError(error.message);
    } else {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, price: newPrice } : it)),
      );
    }
  };

  const handleSignOut = async () => {
    if (!supabaseEnabled) {
      window.localStorage.removeItem("freelance-1.creator.local");
    } else {
      await supabase.auth.signOut();
    }
    router.push("/");
  };

  const visibleItems = items.filter((it) => {
    const cat = it.category ?? inferCategoryFromText(it.description ?? it.name);
    return cat === categoryFilter;
  });

  return (
    <PageShell
      eyebrow="Admin"
      title="Creator dashboard"
      subtitle="Manage products and review incoming orders — same premium theme, creator-only access."
      contentClassName="pt-8"
    >
      <ScrollReveal variant="scale" y={20}>
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/60 p-4 shadow-sm ring-1 ring-black/[0.03] backdrop-blur transition-shadow duration-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {currentUserEmail ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-neutral-800">
              Signed in as {currentUserEmail}
            </span>
          ) : null}
          {!supabaseEnabled ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
              Local mode (Supabase off)
            </span>
          ) : null}

          <div className="flex rounded-full border border-black/10 bg-white/70 p-1 text-sm">
            <button
              onClick={() => setActiveTab("products")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "products"
                  ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/10"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Products
            </button>
            <button
              onClick={async () => {
                setActiveTab("orders");
                await loadOrders();
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "orders"
                  ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/10"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Orders
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-white"
          >
            View shop
          </button>
          <button
            onClick={handleSignOut}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Sign out
          </button>
        </div>
      </div>
      </ScrollReveal>

        {activeTab === "products" ? (
          <ScrollReveal delay={0.05} variant="fade-up" y={28}>
          <div className="flex flex-col gap-8 md:flex-row">
            <section className="w-full md:w-1/3">
              <h2 className="mb-4 text-base font-semibold text-zinc-900">
                Add new clothing item
              </h2>
              <form
                onSubmit={handleCreate}
                className="space-y-4 rounded-3xl border border-black/10 bg-white/60 p-5 shadow-sm ring-1 ring-black/[0.03] backdrop-blur"
              >
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={(e) => {
                      const next = e.target.value as ClothingCategory;
                      setForm((prev) => ({
                        ...prev,
                        category: next,
                        subcategory: SUBCATEGORIES[next][0],
                      }));
                      setCategoryFilter(next);
                    }}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                  >
                    {CLOTHING_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Subcategory
                  </label>
                  <select
                    name="subcategory"
                    value={form.subcategory}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                  >
                    {SUBCATEGORIES[form.category].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Price (INR)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Creator rating (1-5)
                  </label>
                  <input
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Upload image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (formImagePreviewUrl) {
                        URL.revokeObjectURL(formImagePreviewUrl);
                      }
                      setFormImageFile(file);
                      setFormImagePreviewUrl(
                        file ? URL.createObjectURL(file) : null,
                      );
                    }}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                  />
                  {formImagePreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formImagePreviewUrl}
                      alt="Selected"
                      className="mt-2 h-24 w-full rounded-lg object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="in_stock"
                    name="in_stock"
                    type="checkbox"
                    checked={form.in_stock}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <label htmlFor="in_stock" className="text-sm text-zinc-700">
                    In stock
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {saving ? "Saving..." : "Add item"}
                </button>
              </form>
            </section>

            <section className="w-full md:w-2/3">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-zinc-900">
                  Existing items
                </h2>
                <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        setError(null);
                        await loadItems();
                      }}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      Reload
                    </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500">
                      Category
                    </span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        const next = e.target.value as ClothingCategory;
                        setCategoryFilter(next);
                        setForm((prev) => ({
                          ...prev,
                          category: next,
                          subcategory: SUBCATEGORIES[next][0],
                        }));
                      }}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                    >
                      {CLOTHING_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {loading && (
                    <span className="text-xs text-zinc-500">Loading items...</span>
                  )}
                </div>
              </div>

              {error && !saving && (
                <p className="mb-3 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              {visibleItems.length === 0 && !loading ? (
                <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
                  No clothes yet. Add your first item using the form on the left.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {visibleItems.map((item) => (
                    <CreatorItemCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      onToggleStock={handleToggleStock}
                      onPriceChange={handlePriceChange}
                      onEdit={openEdit}
                    />
                  ))}
                </div>
              )}
            </section>

            {editing ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                role="dialog"
                aria-modal="true"
              >
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">
                        Edit item
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Update the details and save.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleUpdate} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">
                        Name
                      </label>
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">
                        Category
                      </label>
                      <select
                        name="category"
                        value={editForm.category}
                        onChange={(e) => {
                          const next = e.target.value as ClothingCategory;
                          setEditForm((prev) => ({
                            ...prev,
                            category: next,
                            subcategory: SUBCATEGORIES[next][0],
                          }));
                        }}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      >
                        {CLOTHING_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">
                        Subcategory
                      </label>
                      <select
                        name="subcategory"
                        value={editForm.subcategory}
                        onChange={handleEditChange}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      >
                        {SUBCATEGORIES[editForm.category].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">
                          Price (INR)
                        </label>
                        <input
                          name="price"
                          type="number"
                          min="0"
                          step="1"
                          value={editForm.price}
                          onChange={handleEditChange}
                          required
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700">
                          Creator rating (1-5)
                        </label>
                        <input
                          name="rating"
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={editForm.rating}
                          onChange={handleEditChange}
                          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-7">
                        <input
                          id="edit_in_stock"
                          name="in_stock"
                          type="checkbox"
                          checked={editForm.in_stock}
                          onChange={handleEditChange}
                          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        />
                        <label
                          htmlFor="edit_in_stock"
                          className="text-sm text-zinc-700"
                        >
                          In stock
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">
                        Replace image (optional)
                      </label>

                      {editForm.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editForm.image_url}
                          alt="Current"
                          className="mt-2 h-24 w-full rounded-lg object-cover"
                        />
                      ) : null}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          if (editImagePreviewUrl) {
                            URL.revokeObjectURL(editImagePreviewUrl);
                          }
                          setEditImageFile(file);
                          setEditImagePreviewUrl(
                            file ? URL.createObjectURL(file) : null,
                          );
                        }}
                        className="mt-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/5"
                      />

                      {editImagePreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editImagePreviewUrl}
                          alt="Selected"
                          className="mt-2 h-24 w-full rounded-lg object-cover"
                        />
                      ) : null}
                    </div>

                    {error && (
                      <p className="text-sm text-red-600" role="alert">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal variant="fade-left" y={24}>
          <section className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm ring-1 ring-black/[0.04] transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Orders</h2>
              <button
                onClick={loadOrders}
                className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Refresh
              </button>
            </div>

            <p className="mt-2 text-sm text-zinc-600">
              Orders are created when a user clicks “Buy” in the cart.
            </p>

            {ordersError ? (
              <div className="mt-4 rounded-xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-medium">Couldn’t load orders.</p>
                <p className="mt-1">{ordersError}</p>
                <p className="mt-2 text-red-700/80">
                  If this is your first time, create an <code>orders</code>{" "}
                  table in Supabase (fields: <code>items</code> as jsonb,{" "}
                  <code>total</code> numeric, <code>created_at</code> timestamp,
                  etc.) or disable RLS for testing.
                </p>
              </div>
            ) : null}

            {ordersLoading ? (
              <p className="mt-4 text-sm text-zinc-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500">
                No orders yet.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      <th className="border-b border-zinc-200 py-3 pr-4">
                        Date
                      </th>
                      <th className="border-b border-zinc-200 py-3 pr-4">
                        Customer
                      </th>
                      <th className="border-b border-zinc-200 py-3 pr-4">
                        Delivery & payment
                      </th>
                      <th className="border-b border-zinc-200 py-3 pr-4">
                        Total
                      </th>
                      <th className="border-b border-zinc-200 py-3 pr-4">
                        Status
                      </th>
                      <th className="border-b border-zinc-200 py-3">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={String(o.id)} className="text-sm">
                        <td className="border-b border-zinc-100 py-3 pr-4 text-zinc-700">
                          {new Date(o.created_at).toLocaleString()}
                        </td>
                        <td className="border-b border-zinc-100 py-3 pr-4 align-top">
                          <div className="text-zinc-900">
                            {o.customer_email || "—"}
                          </div>
                          <div className="text-xs text-zinc-500">
                            Phone: {o.customer_phone || "—"}
                          </div>
                        </td>
                        <td className="border-b border-zinc-100 py-3 pr-4 align-top text-xs text-zinc-700">
                          <div>
                            <span className="font-medium">Address: </span>
                            {(() => {
                              const manual = o.location_manual ?? null;
                              const coords = o.location_coords ?? null;
                              if (o.location_mode === "manual") {
                                return manual || coords || "—";
                              }
                              if (o.location_mode === "current") {
                                return coords || manual || "—";
                              }
                              // location_mode missing: show whichever exists
                              return manual || coords || "—";
                            })()}
                          </div>
                          <div className="mt-1">
                            <span className="font-medium">Payment: </span>
                            {formatPaymentMethod(o.payment_method)}
                          </div>
                        </td>
                        <td className="border-b border-zinc-100 py-3 pr-4 font-medium text-zinc-900">
                          {o.currency === "INR" || !o.currency
                            ? `₹${Math.round(o.total ?? 0).toLocaleString("en-IN")}`
                            : `${o.total ?? 0} ${o.currency}`}
                        </td>
                        <td className="border-b border-zinc-100 py-3 pr-4">
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                            {o.status ?? "—"}
                          </span>
                        </td>
                        <td className="border-b border-zinc-100 py-3">
                          <details className="cursor-pointer select-none">
                            <summary className="text-sm text-zinc-700 underline underline-offset-4">
                              View
                            </summary>
                            <div className="mt-2 max-h-64 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700">
                              {parseOrderItems(o.items).length ? (
                                <div className="space-y-2">
                                  {parseOrderItems(o.items).map((it, idx) => {
                                    const qty = Number(it.qty ?? 1) || 1;
                                    const price = Number(it.price ?? 0) || 0;
                                    const lineTotal =
                                      it.lineTotal != null
                                        ? Number(it.lineTotal)
                                        : price * qty;

                                    return (
                                      <div
                                        key={`${o.id}-${idx}`}
                                        className="flex items-start justify-between gap-3"
                                      >
                                        <div>
                                          <div className="font-medium text-zinc-900">
                                            {it.name || "Item"}
                                          </div>
                                          <div className="text-zinc-600">
                                            Qty: {qty}
                                          </div>
                                        </div>
                                        <div className="text-right font-medium text-zinc-900">
                                          ₹
                                          {Number.isFinite(lineTotal)
                                            ? Math.round(lineTotal).toLocaleString(
                                                "en-IN",
                                              )
                                            : "—"}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <pre className="max-h-64 overflow-auto rounded-lg p-2">
                                  {JSON.stringify(o.items, null, 2)}
                                </pre>
                              )}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          </ScrollReveal>
        )}
    </PageShell>
  );
}

type CreatorItemCardProps = {
  item: ClothingItem;
  onDelete: (id: number) => void;
  onToggleStock: (item: ClothingItem) => void;
  onPriceChange: (item: ClothingItem, newPrice: number) => void;
  onEdit: (item: ClothingItem) => void;
};

function CreatorItemCard({
  item,
  onDelete,
  onToggleStock,
  onPriceChange,
  onEdit,
}: CreatorItemCardProps) {
  const reduceMotion = useReducedMotion();
  const [priceInput, setPriceInput] = useState(item.price.toString());
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  const handleBlur = async () => {
    const newPrice = Number(priceInput);
    if (Number.isNaN(newPrice) || newPrice === item.price) return;
    setIsUpdatingPrice(true);
    await onPriceChange(item, newPrice);
    setIsUpdatingPrice(false);
  };

  return (
    <motion.div
      className="flex flex-col gap-3 rounded-2xl border border-transparent bg-white p-4 shadow-sm transition-shadow duration-300 hover:border-black/10 hover:shadow-lg"
      whileHover={reduceMotion ? undefined : { y: -4, transition: { type: "spring", stiffness: 400, damping: 28 } }}
    >
      <div className="flex items-start gap-3">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            className="h-20 w-20 rounded-lg object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400">
            No image
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-medium text-zinc-900">{item.name}</h3>
          {item.category ? (
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
              {item.category}
            </p>
          ) : null}
          {item.subcategory ? (
            <p className="mt-1 text-[11px] text-zinc-500">{item.subcategory}</p>
          ) : null}
          <p className="mt-1 text-[11px] font-medium text-amber-700">
            {"★".repeat(Math.round(normalizeRating(item.rating ?? 4)))}{" "}
            <span className="text-zinc-500">
              ({normalizeRating(item.rating ?? 4).toFixed(1)})
            </span>
          </p>
          {item.description && (
            <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Price:</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onBlur={handleBlur}
            className="w-24 rounded-md border border-zinc-200 px-2 py-1 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/5"
          />
          {isUpdatingPrice && (
            <span className="text-xs text-zinc-500">Saving...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStock(item)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              item.in_stock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {item.in_stock ? "In stock" : "Out of stock"}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

