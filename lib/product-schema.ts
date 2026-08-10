import { z } from "zod";

/**
 * Serverová validace produktů. Klientský formulář hlídá totéž, ale rozhoduje
 * až tenhle soubor — do API se dá poslat cokoliv.
 */

/** Fotka smí pocházet jen z repa (`/products/…`) nebo z našeho Blobu. Nic cizího. */
const imageSource = z
  .string()
  .trim()
  .min(1, "Cesta k fotce nesmí být prázdná.")
  .max(500)
  .refine(
    (value) =>
      value.startsWith("/products/") ||
      /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(value),
    "Fotka musí být z webu nebo z nahraných souborů.",
  );

const colorSchema = z.object({
  name: z.string().trim().min(1, "Název barvy je povinný.").max(60),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Barva musí být ve tvaru #RRGGBB."),
});

const specsSchema = z.object({
  barva: z.string().trim().min(1, "Barva je povinná.").max(120),
  strih: z.string().trim().min(1, "Střih je povinný.").max(120),
  zapinani: z.string().trim().min(1, "Zapínání je povinné.").max(120),
  vzor: z.string().trim().min(1, "Vzor je povinný.").max(120),
  material: z.string().trim().min(1, "Materiál je povinný.").max(200),
  velikosti: z.string().trim().min(1, "Velikosti jsou povinné.").max(120),
});

export const productSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, "Identifikátor je povinný.")
      .max(60)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Identifikátor smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky.",
      ),
    name: z.string().trim().min(1, "Název je povinný.").max(80),
    tagline: z.string().trim().min(1, "Podtitulek je povinný.").max(120),
    description: z.string().trim().min(1, "Popis je povinný.").max(2000),
    heroImage: imageSource,
    images: z
      .array(imageSource)
      .min(1, "Přidejte alespoň jednu fotku.")
      .max(12, "Víc než 12 fotek galerie neunese."),
    category: z.string().trim().min(1, "Kategorie je povinná.").max(80),
    occasion: z.string().trim().min(1, "Příležitost je povinná.").max(80),
    specs: specsSchema,
    colors: z.array(colorSchema).max(6, "Maximálně 6 barev."),
    hidden: z.boolean().optional(),
  })
  .refine((product) => product.images.includes(product.heroImage), {
    message: "Hlavní fotka musí být jedna z fotek galerie.",
    path: ["heroImage"],
  });

export const productsPayloadSchema = z.object({
  updatedAt: z.string().min(1),
  products: z
    .array(productSchema)
    .max(60, "Kolekce je omezená na 60 obleků.")
    .refine(
      (products) =>
        new Set(products.map((product) => product.id)).size === products.length,
      "Dva obleky nemohou mít stejný identifikátor.",
    ),
});

export type ProductInput = z.infer<typeof productSchema>;

/** První chybová hláška v podobě, kterou jde ukázat uživateli. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Data nejsou platná.";
}

/** Vyrobí identifikátor z názvu: "Modrý oblek" → "modry-oblek". */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diakritika rozložená přes NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
