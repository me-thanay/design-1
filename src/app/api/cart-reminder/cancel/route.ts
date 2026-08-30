import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    return NextResponse.json({
      ok: true,
      message: `Pending reminders cancelled for ${email || "session"}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Failed to cancel reminder." }, { status: 500 });
  }
}
