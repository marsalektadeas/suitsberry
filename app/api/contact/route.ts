import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Simple in-memory rate limiter: max 3 requests per 10 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  website?: string; // honeypot
};

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů. Zkuste to prosím za chvíli." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Neplatný formát dat." },
      { status: 400 }
    );
  }

  const payload = body as ContactPayload;

  // Honeypot check — bots fill this, humans don't
  if (payload.website) {
    return NextResponse.json(
      { success: true, message: "Zpráva přijata. Ozveme se do 24 hodin." },
      { status: 200 }
    );
  }

  if (!payload.name?.trim()) {
    return NextResponse.json({ error: "Jméno je povinné." }, { status: 422 });
  }
  if (!payload.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return NextResponse.json(
      { error: "Zadejte platnou e-mailovou adresu." },
      { status: 422 }
    );
  }
  if (!payload.message?.trim()) {
    return NextResponse.json({ error: "Zpráva je povinná." }, { status: 422 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Suitsberry <onboarding@resend.dev>",
    to: "marsalektadeas@gmail.com",
    subject: `Nová poptávka od ${payload.name}`,
    html: `
      <p><strong>Jméno:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Telefon:</strong> ${payload.phone || "-"}</p>
      <p><strong>Zpráva:</strong><br/>${payload.message}</p>
    `,
  });

  return NextResponse.json(
    { success: true, message: "Zpráva přijata. Ozveme se do 24 hodin." },
    { status: 200 }
  );
}
