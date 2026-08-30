import { NextResponse } from "next/server";

// In-memory registry for pending cart sessions during app runtime (with fallback)
const pendingCartReminders = new Map<
  string,
  {
    email: string;
    items: any[];
    subtotal: number;
    updatedAt: number;
    reminderSent: boolean;
  }
>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, items, subtotal } = body;

    if (!email || !items || items.length === 0) {
      return NextResponse.json({ ok: false, error: "Email and items required." }, { status: 400 });
    }

    const key = email.trim().toLowerCase();
    pendingCartReminders.set(key, {
      email: key,
      items,
      subtotal: Number(subtotal) || 0,
      updatedAt: Date.now(),
      reminderSent: false,
    });

    return NextResponse.json({
      ok: true,
      message: "Cart activity tracked.",
      trackedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to track cart." }, { status: 500 });
  }
}
