import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Suitsberry <onboarding@resend.dev>",
    to: "marsalektadeas@gmail.com",
    subject: `Nová poptávka od ${payload.name}`,
    html: `
      <p><strong>Jméno:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Telefon:</strong> ${payload.phone || "-"}</p>
      <p><strong>Zájem:</strong> ${payload.interest || "-"}</p>
      <p><strong>Zpráva:</strong><br/>${payload.message}</p>
    `,
  });

  return NextResponse.json(
    { success: true, message: "Zpráva přijata. Ozveme se do 24 hodin." },
    { status: 200 }
  );
}
