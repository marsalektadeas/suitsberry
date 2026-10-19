import type { Product } from "@/data/products";
import type { Lead, LeadUpdate } from "@/lib/lead-schema";

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

export type LeadResult =
  | { ok: true; lead: Lead }
  | { ok: false; error: string };

export type DeleteResult = { ok: true } | { ok: false; error: string };

async function leadRequest(
  id: string,
  init: RequestInit,
): Promise<{ ok: true; data: { lead?: Lead } } | { ok: false; error: string }> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/leads/${id}`, init);
  } catch {
    return { ok: false, error: "Nepodařilo se spojit se serverem. Zkontrolujte připojení." };
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    lead?: Lead;
  };
  if (!response.ok) {
    return { ok: false, error: data.error ?? "Akce se nezdařila." };
  }
  return { ok: true, data };
}

/** Uloží stav a poznámku. `update.updatedAt` hlídá, že nepřepíšeme cizí změnu. */
export async function saveLead(id: string, update: LeadUpdate): Promise<LeadResult> {
  const result = await leadRequest(id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!result.ok) return result;
  if (!result.data.lead) return { ok: false, error: "Uložení se nezdařilo." };
  return { ok: true, lead: result.data.lead };
}

export async function removeLead(id: string): Promise<DeleteResult> {
  const result = await leadRequest(id, { method: "DELETE" });
  return result.ok ? { ok: true } : result;
}
