import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateCartReminderHtml, generateCartReminderSubject } from "@/lib/cart-reminder-email";
import type { CartItem } from "@/components/cart/CartProvider";

type CartReminderPayload = {
  to: string;
  customerName?: string | null;
  items: CartItem[];
  subtotal?: number;
  cartUrl?: string;
};

function env(name: string) {
  return process.env[name] ?? "";
}

export async function POST(req: Request) {
  let body: CartReminderPayload;
  try {
    body = (await req.json()) as CartReminderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { to, customerName, items } = body;

  if (!to || !to.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email address is required." }, { status: 400 });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart items cannot be empty." }, { status: 400 });
  }

  const origin = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
  const baseNoSlash = origin.replace(/\/$/, "");
  const cartUrl = body.cartUrl || `${baseNoSlash}/cart`;

  const calculatedSubtotal =
    typeof body.subtotal === "number" && body.subtotal > 0
      ? body.subtotal
      : items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  const subject = generateCartReminderSubject(items);
  const html = generateCartReminderHtml({
    customerName,
    items,
    subtotal: calculatedSubtotal,
    cartUrl,
  });

  const smtpHost = env("SMTP_HOST");
  const smtpPort = Number(env("SMTP_PORT") || "0");
  const smtpUser = env("SMTP_USER");
  const smtpPass = env("SMTP_PASS");
  const fromEmail = env("SMTP_FROM") || (smtpUser ? `"Sawbhagya" <${smtpUser}>` : "");

  // If SMTP is not yet configured, log for local testing and return a helpful response
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    console.warn(
      `[Cart Reminder] SMTP not configured. (Simulated send to ${to})\nSubject: ${subject}\nItems (${items.length}): ${items.map((i) => i.name).join(", ")}`,
    );
    return NextResponse.json({
      ok: true,
      simulated: true,
      message: "SMTP is not configured in .env.local yet. Email payload was logged in terminal.",
      preview: {
        to,
        subject,
        itemCount: items.length,
        subtotal: calculatedSubtotal,
      },
    });
  }

  try {
    const isSsl = smtpPort === 465;
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSsl,
      auth: { user: smtpUser, pass: smtpPass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });

    const plainText = [
      customerName ? `Hello ${customerName},` : "Hello,",
      "",
      "You left beautiful pieces waiting in your Sawbhagya shopping bag:",
      ...items.map(
        (i) =>
          `• ${i.name} (Qty: ${i.qty}) - ₹${Math.round(i.price * i.qty).toLocaleString("en-IN")}`,
      ),
      "",
      `Total Value: ₹${Math.round(calculatedSubtotal).toLocaleString("en-IN")}`,
      "",
      `Complete your order here: ${cartUrl}`,
      "",
      "Warm regards,",
      "Sawbhagya Luxury Edit",
    ].join("\n");

    await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text: plainText,
      html,
    });

    return NextResponse.json({
      ok: true,
      sent: true,
      message: `Cart reminder email successfully sent to ${to}`,
    });
  } catch (err: any) {
    console.error("[Cart Reminder Send Error]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Failed to send email via SMTP transporter.",
      },
      { status: 500 },
    );
  }
}
