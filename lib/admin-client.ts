import type { Product } from "@/data/products";

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string; isConflict: boolean };

/**
 * Uloží celou kolekci. `updatedAt` je razítko, se kterým klient pracoval —
 * server podle něj pozná, že mezitím uložil někdo jiný, a odmítne přepis.
 */
export async function saveProducts(
  products: Product[],
  updatedAt: string,
): Promise<SaveResult> {
  let response: Response;
  try {
    response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products, updatedAt }),
    });
  } catch {
    return {
      ok: false,
      isConflict: false,
      error: "Nepodařilo se spojit se serverem. Zkontrolujte připojení.",
    };
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    updatedAt?: string;
  };

  if (!response.ok || !data.updatedAt) {
    return {
      ok: false,
      isConflict: response.status === 409,
      error: data.error ?? "Uložení se nezdařilo.",
    };
  }

  return { ok: true, updatedAt: data.updatedAt };
}
