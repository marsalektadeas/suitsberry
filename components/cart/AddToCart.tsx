"use client";

import { useId, useState } from "react";

import type { Product } from "@/data/products";
import { parseSizes } from "@/lib/product-sizes";
import AddedToCartDialog from "./AddedToCartDialog";
import { useCart } from "./CartProvider";
import FreeExchangeNote from "./FreeExchangeNote";

type Props = {
  product: Product;
  /** Zavře detail obleku a otevře košík. */
  onShowCart: () => void;
  /** Zavře detail obleku a vrátí zákazníka ke kolekci. */
  onContinueShopping: () => void;
};

const primaryButtonClass =
  "inline-flex items-center justify-center h-12 px-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028] transition-colors duration-200";

const selectClass =
  "w-full h-12 bg-[#141414] border px-3 text-[#F0EDE8] text-base focus:outline-none focus:border-[#C8A028] transition-colors duration-200";

/** Výběr barvy a velikosti + přidání do košíku. Velikost je povinná. */
export default function AddToCart({ product, onShowCart, onContinueShopping }: Props) {
  const { add } = useCart();
  const id = useId();
  const sizes = parseSizes(product.specs.velikosti);
  const [color, setColor] = useState(product.colors[0]?.name ?? null);
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [addedSize, setAddedSize] = useState<string | null>(null);

  function handleAdd() {
    if (!size) {
      setSizeError("Vyberte prosím velikost.");
      return;
    }
    add({ productId: product.id, color, size, quantity: 1 });
    setAddedSize(size);
  }

  return (
    <div className="flex flex-col gap-3">
      {product.colors.length > 1 && (
        <div>
          <label htmlFor={`${id}-color`} className="sr-only">Barva</label>
          <select
            id={`${id}-color`}
            value={color ?? ""}
            onChange={(event) => setColor(event.target.value)}
            className={`${selectClass} border-white/15`}
          >
            {product.colors.map((option) => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <div className="w-28 flex-shrink-0">
          <label htmlFor={`${id}-size`} className="sr-only">Velikost</label>
          <select
            id={`${id}-size`}
            value={size}
            onChange={(event) => {
              setSize(event.target.value);
              setSizeError("");
            }}
            aria-invalid={sizeError ? true : undefined}
            aria-describedby={sizeError ? `${id}-size-error` : undefined}
            className={`${selectClass} ${sizeError ? "border-red-400" : "border-white/15"}`}
          >
            <option value="" disabled>
              Velikost
            </option>
            {sizes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={handleAdd} className={`flex-1 ${primaryButtonClass}`}>
          Přidat do košíku
        </button>
      </div>
      {sizeError && (
        <p id={`${id}-size-error`} className="-mt-1 text-sm text-red-400">
          {sizeError}
        </p>
      )}

      <FreeExchangeNote className="justify-center text-xs" />
      <p className="-mt-2 text-center text-xs text-[#888580] leading-relaxed">
        Nic neplatíte online. Objednávku schválíme a zavoláme vám.
      </p>

      {addedSize && (
        <AddedToCartDialog
          product={product}
          size={addedSize}
          onContinue={onContinueShopping}
          onShowCart={onShowCart}
        />
      )}
    </div>
  );
}
