"use client";

import { useState, useRef, useCallback } from "react";
import { products, type Product } from "@/data/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function Collection() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const updateArrows = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth * 0.78 + 20; // 78vw + gap
    el.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" });
  };

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

          {/* Mobile: horizontal carousel */}
          <div className="sm:hidden relative">
            {/* Left arrow */}
            <button
              onClick={() => scroll("left")}
              aria-label="Předchozí"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-1 flex items-center justify-center w-9 h-9 rounded-full bg-[#0A0A0A]/80 border border-[#C8A028]/40 text-[#C8A028] transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="#C8A028" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Right arrow */}
            <button
              onClick={() => scroll("right")}
              aria-label="Další"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-1 flex items-center justify-center w-9 h-9 rounded-full bg-[#0A0A0A]/80 border border-[#C8A028]/40 text-[#C8A028] transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="#C8A028" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              ref={carouselRef}
              onScroll={updateArrows}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 gap-5 pb-2"
            >
              {products.filter((p) => !p.hidden).map((product) => (
                <div key={product.id} className="snap-start flex-none w-[78vw]">
                  <ProductCard product={product} onSelect={setSelected} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
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
