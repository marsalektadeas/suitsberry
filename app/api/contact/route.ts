import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  interest?: string;
};

export async function POST(request: NextRequest) {
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

  // Mock handler — v produkci napojit na e-mail (Resend, SendGrid) nebo CRM
  console.log("[contact] Nová poptávka:", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || "-",
    message: payload.message,
    interest: payload.interest || "-",
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    { success: true, message: "Zpráva přijata. Ozveme se do 24 hodin." },
    { status: 200 }
  );
}
