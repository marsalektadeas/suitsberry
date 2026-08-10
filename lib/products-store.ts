import "server-only";

import { del, list, put } from "@vercel/blob";
import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";

import { products as fallbackProducts, type Product } from "@/data/products";

/**
 * Produkty žijí jako jeden JSON dokument ve Vercel Blobu.
 *
 * Každé uložení zapíše NOVÝ soubor `data/products/<timestamp>.json` místo přepsání
 * toho starého. Důvod: veřejné Blob URL jsou za CDN a přepsaný soubor by se mohl
 * chvíli číst zastaralý. Nová cesta = nové URL = žádná stará cache.
 * Vedlejší efekt zdarma: pár posledních verzí zůstane jako záloha.
 */

const PREFIX = "data/products/";
const KEEP_VERSIONS = 5;

export const PRODUCTS_TAG = "products";

export type ProductsDocument = {
  version: 1;
  updatedAt: string;
  products: Product[];
};

/** Chybí `BLOB_READ_WRITE_TOKEN` — číst jde z výchozí sady, ukládat ne. */
export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Úložiště fotek a produktů není nastavené. Ve Vercelu chybí Blob store a proměnná BLOB_READ_WRITE_TOKEN.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

/** Uložení odmítnuto, protože mezitím uložil někdo jiný (nebo jiné okno). */
export class StaleWriteError extends Error {
  constructor(public readonly currentUpdatedAt: string) {
    super("Produkty mezitím upravil někdo jiný.");
    this.name = "StaleWriteError";
  }
}

/**
 * Bez přístupu k úložišti není kam ukládat — admin to musí umět říct, ne spadnout.
 *
 * Vercel dnes propojený Blob store autorizuje přes OIDC (`BLOB_STORE_ID`
 * + `VERCEL_OIDC_TOKEN`, který si běhové prostředí doplní samo). Starší
 * `BLOB_READ_WRITE_TOKEN` je pořád podporovaný, takže platí obojí.
 */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

function fallbackDocument(): ProductsDocument {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    products: fallbackProducts,
  };
}

async function findLatestBlob() {
  const { blobs } = await list({ prefix: PREFIX });
  if (blobs.length === 0) return null;

  // Timestampy jsou stejně dlouhé, takže lexikografické řazení = chronologické.
  return blobs.reduce((newest, blob) =>
    blob.pathname > newest.pathname ? blob : newest,
  );
}

/** Čte aktuální dokument bez cache. Chyby propaguje — volající rozhodne, co s nimi. */
export async function readProductsDocument(): Promise<ProductsDocument> {
  // Nenastavené úložiště není chyba čtení — vrací se výchozí kolekce.
  if (!isStorageConfigured()) return fallbackDocument();

  const latest = await findLatestBlob();
  if (!latest) return fallbackDocument();

  // Obsah na dané cestě se nikdy nemění (každé uložení = nová cesta), takže
  // se smí cachovat natvrdo. Čerstvost zajišťuje `list()` výše, ne tenhle fetch.
  const response = await fetch(latest.url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(
      `Nepodařilo se načíst produkty z Blobu (HTTP ${response.status}).`,
    );
  }

  return (await response.json()) as ProductsDocument;
}

async function readProductsDocumentSafe(): Promise<ProductsDocument> {
  try {
    return await readProductsDocument();
  } catch (error) {
    // Web nesmí spadnout kvůli výpadku úložiště — radši ukáže výchozí kolekci.
    console.error("[products-store] čtení selhalo, používám fallback:", error);
    return fallbackDocument();
  }
}

/**
 * Produkty pro veřejný web — bez skrytých, cachované pod tagem `products`.
 * Cache shazuje `writeProductsDocument()` po každém uložení v adminu.
 */
export const getVisibleProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const document = await readProductsDocumentSafe();
    return document.products.filter((product) => !product.hidden);
  },
  ["products-visible"],
  { tags: [PRODUCTS_TAG] },
);

async function pruneOldVersions() {
  const { blobs } = await list({ prefix: PREFIX });
  const obsolete = blobs
    .sort((a, b) => b.pathname.localeCompare(a.pathname))
    .slice(KEEP_VERSIONS);

  if (obsolete.length > 0) {
    await del(obsolete.map((blob) => blob.url));
  }
}

/**
 * Uloží novou verzi produktů.
 *
 * `expectedUpdatedAt` je razítko, které měl klient načtené. Když se neshoduje
 * s aktuálním stavem, uložení se odmítne místo tichého přepsání cizí změny.
 * `null` přeskočí kontrolu (používá jen seed skript).
 */
export async function writeProductsDocument(
  products: Product[],
  expectedUpdatedAt: string | null,
): Promise<ProductsDocument> {
  if (!isStorageConfigured()) {
    throw new StorageNotConfiguredError();
  }

  if (expectedUpdatedAt !== null) {
    const current = await readProductsDocument();
    if (current.updatedAt !== expectedUpdatedAt) {
      throw new StaleWriteError(current.updatedAt);
    }
  }

  const document: ProductsDocument = {
    version: 1,
    updatedAt: new Date().toISOString(),
    products,
  };

  await put(`${PREFIX}${Date.now()}.json`, JSON.stringify(document, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  await pruneOldVersions();

  // `expire: 0` = okamžité vypršení, ne stale-while-revalidate. Po uložení
  // v adminu musí být změna na webu vidět hned, ne až při druhém načtení.
  revalidateTag(PRODUCTS_TAG, { expire: 0 });
  revalidatePath("/");

  return document;
}
