"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type { Product } from "@/data/products";
import {
  addToCart,
  cartLineKey,
  clearCart,
  getCartSnapshot,
  getServerCartSnapshot,
  removeFromCart,
  setQuantity,
  subscribeCart,
  type CartLine,
} from "@/lib/cart";
import CartDrawer from "./CartDrawer";

export type ResolvedCartLine = CartLine & { key: string; product: Product };

type CartContextValue = {
  lines: ResolvedCartLine[];
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (line: CartLine) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * `products` je aktuální viditelná kolekce. Položky obleků, které mezitím
 * zmizely z nabídky, se v košíku nezobrazí a neodešlou.
 */
export default function CartProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  const storedLines = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);

  const lines = useMemo(
    () =>
      storedLines.flatMap((line) => {
        const product = products.find((candidate) => candidate.id === line.productId);
        return product ? [{ ...line, key: cartLineKey(line), product }] : [];
      }),
    [storedLines, products],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value: CartContextValue = {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    isOpen,
    openCart,
    closeCart,
    add: addToCart,
    setQuantity,
    remove: removeFromCart,
    clear: clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart() musí být uvnitř <CartProvider>.");
  return context;
}
