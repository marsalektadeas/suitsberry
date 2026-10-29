import { NextRequest, NextResponse } from "next/server";

import type { Product } from "@/data/products";
import { notifyNewLead, sendOrderConfirmation } from "@/lib/lead-notify";
import {
  fieldErrors,
  formatOrderNumber,
  orderSchema,
  sumItems,
  type LeadItem,
} from "@/lib/lead-schema";
import { createLead, isDatabaseConfigured } from "@/lib/leads-store";
import { formatCzk } from "@/lib/price";
import { parseSizes } from "@/lib/product-sizes";
import { getVisibleProducts } from "@/lib/products-store";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const isRateLimited = createRateLimiter(3, 10 * 60 * 1000);

type ParsedItem = { productId: string; color?: string; size: string; quantity: number };

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

  const { hp_field, items: requestedItems, ...customer } = parsed.data;
  // Honeypot — botovi tvrdíme úspěch, ať to nezkouší jinak.
  if (hp_field) return NextResponse.json({ success: true, orderNumber: null, confirmationSent: false });

  const resolved = resolveItems(requestedItems, await getVisibleProducts());
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 422 });
  }
  const items = resolved.items;

  // Uložení i e-mail zkusíme oba — stačí, když projde jedno, a objednávka se neztratí.
  let orderNumber: string | null = null;
  if (isDatabaseConfigured()) {
    try {
      const lead = await createLead({ source: "order", ...customer, items });
      orderNumber = formatOrderNumber(lead.number);
    } catch (error) {
      console.error("[orders] uložení do databáze selhalo:", error);
    }
  }

  const itemLines = items.map(describeItem);
  const totalLine = describeTotal(items);
  const notified = await notifyNewLead(
    `Nový nákup ${orderNumber ?? "(neuložen v databázi)"} — ${customer.name}`,
    [
      ["Položky", itemLines.join("\n")],
      ["Celkem", totalLine],
      ["Jméno", customer.name],
      ["Telefon", customer.phone],
      ["E-mail", customer.email],
      ["Poznámka", customer.message],
    ],
  );

  if (!orderNumber && !notified) {
    return NextResponse.json(
      { error: "Odeslání se nezdařilo. Zkuste to prosím znovu, nebo nám zavolejte." },
      { status: 502 },
    );
  }

  // Bez čísla objednávky (databáze neodpověděla) by potvrzení zákazníka spíš zmátlo.
  const confirmationSent = orderNumber
    ? await sendOrderConfirmation({
        to: customer.email,
        customerName: customer.name,
        orderNumber,
        itemLines,
        totalLine,
      })
    : false;

  return NextResponse.json({ success: true, orderNumber, confirmationSent });
}

/**
 * Název a cenu bere z aktuální kolekce, ne z prohlížeče — klient může poslat
 * cokoliv. Odmítne skryté obleky a barvy či velikosti, které oblek nemá.
 */
function resolveItems(
  requested: ParsedItem[],
  products: Product[],
): { ok: true; items: LeadItem[] } | { ok: false; error: string } {
  const items: LeadItem[] = [];

  for (const item of requested) {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      return {
        ok: false,
        error: "Jeden z obleků v košíku už není v nabídce. Odeberte ho prosím a odešlete znovu.",
      };
    }

    const colorNames = product.colors.map((color) => color.name);
    const color = item.color ?? colorNames[0] ?? null;
    if (colorNames.length > 0 && (!color || !colorNames.includes(color))) {
      return { ok: false, error: `Oblek ${product.name} v barvě „${item.color}“ nemáme.` };
    }

    if (!parseSizes(product.specs.velikosti).includes(item.size)) {
      return { ok: false, error: `Oblek ${product.name} ve velikosti ${item.size} nemáme.` };
    }

    items.push({
      productId: product.id,
      productName: product.name,
      color,
      size: item.size,
      quantity: item.quantity,
      unitPriceCzk: product.priceCzk ?? null,
    });
  }

  return { ok: true, items };
}

function describeItem(item: LeadItem): string {
  const variant = [item.color, `velikost ${item.size}`].filter(Boolean).join(", ");
  const price = item.unitPriceCzk === null ? "cena na dotaz" : formatCzk(item.unitPriceCzk);
  return `${item.quantity}× ${item.productName} (${variant}) — ${price}`;
}

function describeTotal(items: LeadItem[]): string {
  const { totalCzk, hasUnpricedItems } = sumItems(items);
  if (totalCzk === 0) return "Cenu potvrdíme po telefonu.";
  return hasUnpricedItems
    ? `Celkem ${formatCzk(totalCzk)} + položky s cenou na dotaz`
    : `Celkem ${formatCzk(totalCzk)}`;
}
