"use client";

import Image from "next/image";
import type { Product } from "@/data/products";

type Props = {
  product: Product;
  onSelect: (product: Product) => void;
};

export default function ProductCard({ product, onSelect }: Props) {
  return (
    <article
      className="group cursor-pointer"
      onClick={() => onSelect(product)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1C1C1C] mb-5">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Desktop hover overlay */}
        <div className="hidden md:flex absolute inset-0 bg-[#0A0A0A]/0 group-hover:bg-[#0A0A0A]/50 transition-all duration-300 items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm tracking-[0.25em] uppercase text-white border border-white/40 px-5 py-3">
            Zobrazit detail
          </span>
        </div>

        {/* Mobile permanent CTA */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent pt-10 pb-4 px-4 flex items-end justify-between">
          <span className="text-xs tracking-[0.25em] uppercase text-white/80">
            Zobrazit detail
          </span>
          <span className="text-[#C8A028] text-lg leading-none">→</span>
        </div>
      </div>

      {/* Info */}
      <div>
        <h3
          className="text-xl font-light text-white mb-1 group-hover:text-[#C8A028] transition-colors duration-200"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          {product.name}
        </h3>
        <p className="text-sm tracking-[0.2em] uppercase text-[#C8A028]">
          {product.occasion}
        </p>
      </div>
    </article>
  );
}
