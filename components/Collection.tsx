"use client";

import { useState } from "react";
import { products, type Product } from "@/data/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function Collection() {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <>
      <section id="kolekce" className="py-24 md:py-36 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-4">
                Kolekce
              </p>
              <h2
                className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                Styl pro každý
                <br />
                <em className="not-italic text-[#C8A028]">výjimečný moment.</em>
              </h2>
            </div>
            <p className="text-[#888580] max-w-xs leading-relaxed text-base md:text-right">
              Každý oblek je pečlivě vybraný tak, aby odpovídal charakteru muže,
              který ho nosí. Kliknutím zobrazíte detail.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {products.filter((p) => !p.hidden).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelected}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p
              className="text-[#888580] mb-8 text-2xl md:text-3xl font-light"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Nenašli jste, co hledáte?
            </p>
            <a
              href="#kontakt"
              className="inline-flex items-center gap-3 text-base tracking-[0.2em] uppercase text-[#F0EDE8] border-b border-[#C8A028] pb-1 hover:text-[#C8A028] transition-colors duration-200"
            >
              Napište nám <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
