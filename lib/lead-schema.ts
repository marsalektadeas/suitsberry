import { z } from "zod";

/**
 * Validace poptávek sdílená klientem i serverem. Rozhoduje server —
 * do API se dá poslat cokoliv, klient jen dřív ukáže chybu u pole.
 */

export type LeadSource = "order" | "contact";

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  order: "Nákup",
  contact: "Poptávka",
};

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "approved",
  "paid",
  "shipped",
  "done",
  "cancelled",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

type StatusOption = { value: LeadStatus; label: string };

/**
 * Nákup a poptávka mají každý vlastní cestu. Nákup čeká na schválení,
 * pak se po telefonu domluví platba a doprava; poptávka je jen „ozvat se“.
 * Databáze hlídá stejná pravidla (`leads_status_check`).
 */
export const STATUS_OPTIONS: Record<LeadSource, readonly StatusOption[]> = {
  order: [
    { value: "new", label: "Ke schválení" },
    { value: "approved", label: "Schváleno" },
    { value: "paid", label: "Zaplaceno" },
    { value: "shipped", label: "Odesláno" },
    { value: "done", label: "Dokončeno" },
    { value: "cancelled", label: "Zamítnuto" },
  ],
  contact: [
    { value: "new", label: "Nová" },
    { value: "contacted", label: "Kontaktováno" },
    { value: "done", label: "Vyřízeno" },
    { value: "cancelled", label: "Zrušeno" },
  ],
};

export function isStatusAllowed(source: LeadSource, status: LeadStatus): boolean {
  return STATUS_OPTIONS[source].some((option) => option.value === status);
}

export function statusLabel(source: LeadSource, status: LeadStatus): string {
  return STATUS_OPTIONS[source].find((option) => option.value === status)?.label ?? status;
}

/** Stavy, u kterých už nic neřešíme — výchozí pohled v adminu je schovává. */
export const CLOSED_STATUSES: readonly LeadStatus[] = ["done", "cancelled"];

/** Položka nákupu, jak ji uložil server — název a cena jsou snímek z okamžiku objednávky. */
export type LeadItem = {
  productId: string;
  productName: string;
  color: string | null;
  size: string;
  quantity: number;
  unitPriceCzk: number | null;
};

export type Lead = {
  id: string;
  /** Krátké číslo pro telefon a e-mail, viz `formatOrderNumber`. */
  number: number;
  createdAt: string;
  updatedAt: string;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  phone: string | null;
  email: string | null;
  /** U poptávky vždy prázdné. */
  items: LeadItem[];
  message: string | null;
  internalNote: string;
};

/** `1042` → „SB-1042“. */
export function formatOrderNumber(number: number): string {
  return `SB-${number}`;
}

/** Součet položek; `hasUnpricedItems` značí, že část ceny ještě domluvíme po telefonu. */
export function sumItems(items: { quantity: number; unitPriceCzk: number | null }[]) {
  let totalCzk = 0;
  let hasUnpricedItems = false;
  for (const item of items) {
    if (item.unitPriceCzk === null) hasUnpricedItems = true;
    else totalCzk += item.unitPriceCzk * item.quantity;
  }
  return { totalCzk, hasUnpricedItems };
}

export const MAX_ITEM_QUANTITY = 5;
const MAX_ORDER_LINES = 20;

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

export const orderItemSchema = z.object({
  productId: z.string().trim().min(1).max(60),
  color: optionalText(60),
  size: z.string().trim().min(1, "Vyberte velikost.").max(30),
  quantity: z.number().int().min(1).max(MAX_ITEM_QUANTITY),
});

export type OrderItemInput = z.input<typeof orderItemSchema>;

export const orderSchema = z.object({
  name,
  phone,
  email: z.email("Zadejte e-mail, pošleme na něj potvrzení objednávky.").max(200),
  message: optionalText(2000),
  items: z
    .array(orderItemSchema)
    .min(1, "Košík je prázdný.")
    .max(MAX_ORDER_LINES, "Tolik položek najednou nepřijmeme, zavolejte nám prosím."),
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
