import { z } from "zod";

import { MAX_ITEM_QUANTITY } from "./lead-schema";

/**
 * Košík žije jen v prohlížeči (localStorage) — na server jde až při odeslání
 * objednávky. Drží jen co zákazník vybral; název a cenu dohledává
 * `CartProvider` v aktuální kolekci, takže nikdy neukáže zastaralou cenu.
 *
 * Napojuje se přes `useSyncExternalStore`, proto subscribe/getSnapshot.
 */

const STORAGE_KEY = "suitsberry:cart";
const MAX_LINES = 20;

const cartLineSchema = z.object({
  productId: z.string().min(1),
  color: z.string().nullable(),
  size: z.string().min(1),
  quantity: z.number().int().min(1).max(MAX_ITEM_QUANTITY),
});

export type CartLine = z.infer<typeof cartLineSchema>;

const EMPTY_CART: CartLine[] = [];
const listeners = new Set<() => void>();
let snapshot: CartLine[] | null = null;

/** Stejný oblek v jiné barvě nebo velikosti je samostatná položka. */
export function cartLineKey(line: Pick<CartLine, "productId" | "color" | "size">): string {
  return `${line.productId}|${line.color ?? ""}|${line.size}`;
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  // Košík upravený v jiném panelu prohlížeče.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getCartSnapshot(): CartLine[] {
  snapshot ??= readStoredCart();
  return snapshot;
}

export function getServerCartSnapshot(): CartLine[] {
  return EMPTY_CART;
}

export function addToCart(line: CartLine): void {
  const lines = getCartSnapshot();
  const key = cartLineKey(line);
  const existing = lines.find((candidate) => cartLineKey(candidate) === key);

  if (existing) {
    setQuantity(key, existing.quantity + line.quantity);
    return;
  }
  writeCart([...lines, line].slice(-MAX_LINES));
}

export function setQuantity(key: string, quantity: number): void {
  const clamped = Math.min(Math.max(quantity, 1), MAX_ITEM_QUANTITY);
  writeCart(
    getCartSnapshot().map((line) =>
      cartLineKey(line) === key ? { ...line, quantity: clamped } : line,
    ),
  );
}

export function removeFromCart(key: string): void {
  writeCart(getCartSnapshot().filter((line) => cartLineKey(line) !== key));
}

export function clearCart(): void {
  writeCart(EMPTY_CART);
}

function writeCart(lines: CartLine[]): void {
  snapshot = lines;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch (error) {
    // Anonymní okno nebo plné úložiště — košík vydrží aspoň do reloadu.
    console.warn("[cart] uložení košíku selhalo:", error);
  }
  listeners.forEach((listener) => listener());
}

function readStoredCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = z.array(cartLineSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_CART;
  } catch {
    // Poškozený JSON nebo zakázané úložiště — začneme s prázdným košíkem.
    return EMPTY_CART;
  }
}
