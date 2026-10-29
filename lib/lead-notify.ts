import "server-only";

import { Resend } from "resend";

const NOTIFY_TO = "marsalektadeas@gmail.com";
const NOTIFY_FROM = "Suitsberry <onboarding@resend.dev>";
const CONTACT_PHONE = "+420 731 152 421";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Upozornění e-mailem na novou poptávku. Hodnoty od návštěvníka se escapují —
 * jinak by kdokoli mohl do e-mailu podstrčit vlastní HTML (např. podvržený odkaz).
 */
export async function notifyNewLead(
  subject: string,
  fields: [label: string, value: string | undefined][],
): Promise<boolean> {
  const html = fields
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}:</strong> ${
          value ? escapeHtml(value).replace(/\n/g, "<br/>") : "-"
        }</p>`,
    )
    .join("\n");

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: NOTIFY_FROM,
    to: NOTIFY_TO,
    subject,
    html: `${html}\n<p><a href="https://suitsberry.cz/admin/poptavky">Otevřít poptávky v adminu</a></p>`,
  });

  if (error) {
    console.error("[lead-notify] Resend selhal:", error);
    return false;
  }
  return true;
}

type OrderConfirmation = {
  to: string;
  customerName: string;
  orderNumber: string;
  itemLines: string[];
  totalLine: string;
};

/**
 * Potvrzení zákazníkovi, že objednávka čeká na schválení. Testovací odesílatel
 * Resendu doručuje jen majiteli účtu, takže bez ověřené domény
 * (`ORDER_CONFIRMATION_FROM`, např. „Suitsberry <objednavky@suitsberry.cz>“)
 * se potvrzení vůbec neposílá — objednávka kvůli tomu neselže.
 */
export async function sendOrderConfirmation(order: OrderConfirmation): Promise<boolean> {
  const from = process.env.ORDER_CONFIRMATION_FROM;
  if (!from) {
    console.info("[lead-notify] ORDER_CONFIRMATION_FROM chybí — potvrzení zákazníkovi se neposílá.");
    return false;
  }

  const items = order.itemLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from,
    to: order.to,
    replyTo: NOTIFY_TO,
    subject: `Objednávka ${order.orderNumber} čeká na schválení`,
    html: `
<p>Dobrý den, ${escapeHtml(order.customerName)},</p>
<p>děkujeme za objednávku <strong>${escapeHtml(order.orderNumber)}</strong>. Zatím nic neplaťte —
objednávku nejdřív schválíme a do 24 hodin vám zavoláme. Domluvíme platbu,
dopravu a případně doladíme velikost.</p>
<ul>${items}</ul>
<p>${escapeHtml(order.totalLine)}</p>
<p>Kdybyste potřebovali cokoliv změnit, odpovězte na tento e-mail nebo volejte ${CONTACT_PHONE}.</p>
<p>Suitsberry</p>`,
  });

  if (error) {
    console.error("[lead-notify] potvrzení zákazníkovi selhalo:", error);
    return false;
  }
  return true;
}
