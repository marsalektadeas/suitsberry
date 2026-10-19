import { z } from "zod";

/**
 * Validace poptávek sdílená klientem i serverem. Rozhoduje server —
 * do API se dá poslat cokoliv, klient jen dřív ukáže chybu u pole.
 */

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "agreed",
  "shipped",
  "done",
  "cancelled",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nová",
  contacted: "Kontaktováno",
  agreed: "Domluveno",
  shipped: "Odesláno",
  done: "Dokončeno",
  cancelled: "Zrušeno",
};

/** Stavy, u kterých už nic neřešíme — výchozí pohled v adminu je schovává. */
export const CLOSED_STATUSES: readonly LeadStatus[] = ["done", "cancelled"];

export type LeadSource = "order" | "contact";

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  order: "Objednávka",
  contact: "Zpráva",
};

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  phone: string | null;
  email: string | null;
  productId: string | null;
  productName: string | null;
  color: string | null;
  size: string | null;
  message: string | null;
  internalNote: string;
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximálně ${max} znaků.`)
    .optional()
    .transform((value) => (value ? value : undefined));

const name = z
  .string()
  .trim()
  .min(1, "Vyplňte prosím jméno.")
  .max(100, "Jméno je příliš dlouhé.");

const phone = z
  .string()
  .trim()
  .min(1, "Vyplňte prosím telefon, ať vám můžeme zavolat.")
  .max(30, "Telefon je příliš dlouhý.")
  .regex(/^\+?[\d\s()-]{9,}$/, "Telefon zadejte ve tvaru +420 777 000 000.");

const email = z.email("Zadejte platnou e-mailovou adresu.").max(200);

/** Honeypot — člověk pole nevidí, bot ho vyplní. Kontroluje se v routě, ne tady. */
const honeypot = z.string().optional();

export const orderSchema = z.object({
  name,
  phone,
  email: z
    .union([email, z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  productId: z.string().trim().min(1).max(60),
  productName: z.string().trim().min(1).max(80),
  color: optionalText(60),
  size: optionalText(30),
  message: optionalText(2000),
  hp_field: honeypot,
});

export type OrderInput = z.input<typeof orderSchema>;

export const contactSchema = z.object({
  name,
  email,
  phone: z
    .string()
    .trim()
    .max(30, "Telefon je příliš dlouhý.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  message: z
    .string()
    .trim()
    .min(1, "Napište nám prosím zprávu.")
    .max(5000, "Zpráva je příliš dlouhá."),
  hp_field: honeypot,
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  internalNote: z.string().max(5000, "Poznámka je příliš dlouhá."),
  updatedAt: z.string().min(1),
});

export type LeadUpdate = z.infer<typeof leadUpdateSchema>;

/** Chyby po polích pro zobrazení přímo u formuláře. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}
