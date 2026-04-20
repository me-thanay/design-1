import { redirect } from "next/navigation";

import { CLOTHING_CATEGORIES, type ClothingCategory } from "@/lib/products";

type PageProps = {
  searchParams: Promise<{ q?: string; cat?: string }>;
};

export default async function SearchRedirectPage({ searchParams }: PageProps) {
  const p = await searchParams;
  const q = (p.q ?? "").trim();
  const catRaw = (p.cat ?? "").trim().toLowerCase();
  const catOk = CLOTHING_CATEGORIES.includes(catRaw as ClothingCategory)
    ? (catRaw as ClothingCategory)
    : null;

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (catOk) params.set("cat", catOk);

  const qs = params.toString();
  redirect(qs ? `/?${qs}` : "/");
}
