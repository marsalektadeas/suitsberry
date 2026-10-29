import { NextRequest, NextResponse } from "next/server";

import { notifyNewLead } from "@/lib/lead-notify";
import { contactSchema, fieldErrors } from "@/lib/lead-schema";
import { createLead, isDatabaseConfigured } from "@/lib/leads-store";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const isRateLimited = createRateLimiter(3, 10 * 60 * 1000);

const SUCCESS = { success: true, message: "Zpráva přijata. Ozveme se do 24 hodin." };

export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request.headers))) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů. Zkuste to prosím za chvíli." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný formát dat." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields = fieldErrors(parsed.error);
    return NextResponse.json(
      { error: Object.values(fields)[0] ?? "Zkontrolujte prosím formulář.", fields },
      { status: 422 },
    );
  }

  const { hp_field, ...contact } = parsed.data;
  // Honeypot — bots fill this, humans don't
  if (hp_field) return NextResponse.json(SUCCESS);

  let saved = false;
  if (isDatabaseConfigured()) {
    try {
      await createLead({ source: "contact", ...contact });
      saved = true;
    } catch (error) {
      console.error("[contact] uložení do databáze selhalo:", error);
    }
  }

  const notified = await notifyNewLead(`Nová poptávka od ${contact.name}`, [
    ["Jméno", contact.name],
    ["E-mail", contact.email],
    ["Telefon", contact.phone],
    ["Zpráva", contact.message],
  ]);

  if (!saved && !notified) {
    return NextResponse.json(
      { error: "Odeslání se nezdařilo. Zkuste to prosím znovu nebo nám zavolejte." },
      { status: 502 },
    );
  }

  return NextResponse.json(SUCCESS);
}
