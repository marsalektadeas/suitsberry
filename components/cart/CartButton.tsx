"use client";

import { plural } from "@/lib/plural";
import { useCart } from "./CartProvider";

export default function CartButton() {
  const { itemCount, openCart } = useCart();
  const label =
    itemCount === 0
      ? "Košík je prázdný"
      : `Košík, ${itemCount} ${plural(itemCount, ["oblek", "obleky", "obleků"])}`;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={label}
      className="relative w-10 h-10 flex items-center justify-center text-[#F0EDE8] hover:text-[#C8A028] focus-visible:text-[#C8A028] focus-visible:outline-none transition-colors duration-200"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 7h12l-1 13H7L6 7Z M9 7V5.5a3 3 0 0 1 6 0V7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C8A028] text-[#0A0A0A] text-[0.65rem] font-medium leading-[18px] text-center">
          {itemCount}
        </span>
      )}
    </button>
  );
}
