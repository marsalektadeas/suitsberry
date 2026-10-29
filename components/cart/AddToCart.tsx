"use client";

import { useId, useState } from "react";

import type { Product } from "@/data/products";
import { formatCzk } from "@/lib/price";
import { parseSizes } from "@/lib/product-sizes";
import { useCart } from "./CartProvider";

type Props = {
  product: Product;
  /** Zavře detail obleku a otevře košík. */
  onShowCart: () => void;
  onEnquire: () => void;
};

const selectClass =
  "w-full h-12 bg-[#141414] border px-3 text-[#F0EDE8] text-base focus:outline-none focus:border-[#C8A028] transition-colors duration-200";

/** Výběr barvy a velikosti + přidání do košíku. Velikost je povinná. */
export default function AddToCart({ product, onShowCart, onEnquire }: Props) {
  const { add } = useCart();
  const id = useId();
  const sizes = parseSizes(product.specs.velikosti);
  const [color, setColor] = useState(product.colors[0]?.name ?? null);
  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [addedLabel, setAddedLabel] = useState<string | null>(null);

  function handleAdd() {
    if (!size) {
      setSizeError("Vyberte prosím velikost.");
      return;
    }
    add({ productId: product.id, color, size, quantity: 1 });
    setAddedLabel(`${product.name}, velikost ${size}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        {product.colors.length > 1 && (
          <div className="flex-1 min-w-0">
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
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-size`} className="sr-only">Velikost</label>
          <select
            id={`${id}-size`}
            value={size}
            onChange={(event) => {
              setSize(event.target.value);
              setSizeError("");
              setAddedLabel(null);
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
        <p className="flex-shrink-0 self-center text-[#F0EDE8] text-lg whitespace-nowrap">
          {product.priceCzk ? formatCzk(product.priceCzk) : (
            <span className="text-sm text-[#A09C97]">Cena na dotaz</span>
          )}
        </p>
      </div>
      {sizeError && (
        <p id={`${id}-size-error`} className="-mt-1 text-sm text-red-400">
          {sizeError}
        </p>
      )}

      {addedLabel ? (
        <div role="status" className="flex flex-col gap-2">
          <p className="text-sm text-[#A09C97] text-center">
            <span className="text-[#C8A028]">✓</span> {addedLabel} je v košíku.
          </p>
          <button
            type="button"
            onClick={onShowCart}
            className="inline-flex items-center justify-center px-6 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028] transition-colors duration-200"
          >
            Zobrazit košík
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center px-6 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028] transition-colors duration-200"
        >
          Přidat do košíku
        </button>
      )}

      <p className="text-center text-xs text-[#888580] leading-relaxed">
        Nic neplatíte online — objednávku schválíme a zavoláme vám.{" "}
        <button
          type="button"
          onClick={onEnquire}
          className="text-[#A09C97] underline underline-offset-4 hover:text-[#C8A028] focus-visible:text-[#C8A028] focus-visible:outline-none"
        >
          Nebo jen nezávazně poptat
        </button>
      </p>
    </div>
  );
}
