"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { Product } from "@/data/products";
import { formatCzk } from "@/lib/price";

type Props = {
  product: Product;
  size: string;
  onContinue: () => void;
  onShowCart: () => void;
};

/** Potvrzení po přidání do košíku: návrat ke kolekci, nebo rovnou do košíku. */
export default function AddedToCartDialog({ product, size, onContinue, onShowCart }: Props) {
  const showCartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    showCartRef.current?.focus();

    // Klávesy nesmí probublat k detailu obleku (Escape by zavřel celý detail, šipky by listovaly galerií).
    function handleKeyDown(event: KeyboardEvent) {
      event.stopPropagation();
      if (event.key === "Escape") onContinue();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onContinue]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 sm:px-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onContinue();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="added-to-cart-title"
        className="w-full sm:max-w-lg border border-white/10 bg-[#141414] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl"
      >
        <h2
          id="added-to-cart-title"
          className="flex items-center gap-2.5 text-base font-medium text-[#F0EDE8]"
        >
          <span className="text-[#C8A028]" aria-hidden="true">✓</span>
          Přidáno do košíku
        </h2>

        <div className="mt-5 flex gap-4">
          <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden bg-[#1C1C1C]">
            <Image src={product.heroImage} alt="" fill className="object-cover object-top" sizes="64px" />
          </div>
          <div className="min-w-0">
            <p
              className="text-2xl font-semibold leading-tight text-[#F0EDE8]"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {product.name}
            </p>
            <p className="mt-1 text-sm text-[#A09C97]">Velikost {size}</p>
            <p className="mt-1 text-sm text-[#F0EDE8]">
              {product.priceCzk ? formatCzk(product.priceCzk) : "Cena na dotaz"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onContinue}
            className="w-full h-14 sm:h-12 sm:flex-1 border border-white/20 px-4 text-sm whitespace-nowrap tracking-[0.1em] uppercase text-[#F0EDE8] transition-colors duration-200 hover:border-white/50 active:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028]"
          >
            Pokračovat v nákupu
          </button>
          <button
            ref={showCartRef}
            type="button"
            onClick={onShowCart}
            className="w-full h-14 sm:h-12 sm:flex-1 bg-[#C8A028] px-4 text-sm whitespace-nowrap tracking-[0.1em] uppercase font-medium text-[#0A0A0A] transition-colors duration-200 hover:bg-[#D4AF40] active:bg-[#B8921F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A028]"
          >
            Přejít do košíku
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
