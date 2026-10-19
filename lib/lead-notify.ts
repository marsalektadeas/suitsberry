import "server-only";

import { Resend } from "resend";

const NOTIFY_TO = "marsalektadeas@gmail.com";
const NOTIFY_FROM = "Suitsberry <onboarding@resend.dev>";

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
