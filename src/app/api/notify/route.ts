import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type NotifyPayload = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};

function env(name: string) {
  return process.env[name] ?? "";
}

export async function POST(req: Request) {
  const smtpHost = env("SMTP_HOST");
  const smtpPort = Number(env("SMTP_PORT") || "0");
  const smtpUser = env("SMTP_USER");
  const smtpPass = env("SMTP_PASS");
  const fromEmail = env("SMTP_FROM") || smtpUser;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return NextResponse.json(
      { ok: false, error: "SMTP is not configured." },
      { status: 501 },
    );
  }

  let body: NotifyPayload;
  try {
    body = (await req.json()) as NotifyPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body?.to || !body?.subject) {
    return NextResponse.json(
      { ok: false, error: "Missing `to` or `subject`." },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: fromEmail,
    to: body.to,
    subject: body.subject,
    text: body.text,
    html: body.html,
  });

  return NextResponse.json({ ok: true });
}

