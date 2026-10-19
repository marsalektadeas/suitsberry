import { NextRequest, NextResponse } from "next/server";

import { notifyNewLead } from "@/lib/lead-notify";
import { fieldErrors, orderSchema } from "@/lib/lead-schema";
import { createLead, isDatabaseConfigured } from "@/lib/leads-store";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const isRateLimited = createRateLimiter(3, 10 * 60 * 1000);

const SUCCESS = { success: true };

export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request.headers))) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů. Zkuste to prosím za chvíli, nebo nám zavolejte." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný formát dat." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Zkontrolujte prosím vyznačená pole.", fields: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }

  const { hp_field, ...order } = parsed.data;
  // Honeypot — botovi tvrdíme úspěch, ať to nezkouší jinak.
  if (hp_field) return NextResponse.json(SUCCESS);

  // Uložení i e-mail zkusíme oba — stačí, když projde jedno, a poptávka se neztratí.
  let saved = false;
  if (isDatabaseConfigured()) {
    try {
      await createLead({ source: "order", ...order });
      saved = true;
    } catch (error) {
      console.error("[orders] uložení do databáze selhalo:", error);
    }
  }

  const notified = await notifyNewLead(`Nová objednávka: ${order.productName} — ${order.name}`, [
    ["Oblek", order.productName],
    ["Barva", order.color],
    ["Velikost", order.size],
    ["Jméno", order.name],
    ["Telefon", order.phone],
    ["E-mail", order.email],
    ["Poznámka", order.message],
  ]);

  if (!saved && !notified) {
    return NextResponse.json(
      { error: "Odeslání se nezdařilo. Zkuste to prosím znovu, nebo nám zavolejte." },
      { status: 502 },
    );
  }

  return NextResponse.json(SUCCESS);
}
