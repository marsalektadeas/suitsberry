"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";

type Props = {
  product: Product;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  const [activeImage, setActiveImage] = useState(0);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const specs = [
    { label: "Barva", value: product.specs.barva },
    { label: "Střih", value: product.specs.strich },
    { label: "Zapínání", value: product.specs.zapinani },
    { label: "Vzor", value: product.specs.vzor },
    { label: "Materiál", value: product.specs.material },
    { label: "Velikosti", value: product.specs.velikosti },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl bg-[#141414] flex flex-col md:flex-row overflow-hidden max-h-[95vh] md:max-h-[85vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors duration-200"
          aria-label="Zavřít"
        >
          ✕
        </button>

        {/* Left — images */}
        <div className="md:w-[45%] flex flex-col flex-shrink-0">
          {/* Main image — shorter on mobile */}
          <div className="relative h-56 sm:h-72 md:h-auto md:flex-1">
            <Image
              src={product.images[activeImage] ?? product.heroImage}
              alt={product.name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3 bg-[#0F0F0F] overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-14 h-18 min-w-[3.5rem] overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    activeImage === i
                      ? "ring-1 ring-[#C8A028]"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover object-top"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — details */}
        <div className="md:w-[55%] overflow-y-auto p-6 md:p-10 flex flex-col gap-5 md:gap-6">
          {/* Category */}
          <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase">
            {product.category}
          </p>

          {/* Name */}
          <h2
            className="text-4xl md:text-5xl font-light text-white leading-tight"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {product.name}
          </h2>

          {/* Description */}
          <p className="text-[#888580] leading-relaxed text-base">
            {product.description}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-white/8" />

          {/* Specs */}
          <div className="flex flex-col gap-0">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between py-3 border-b border-white/8"
              >
                <span className="text-[#888580] text-base">{spec.label}</span>
                <span className="text-[#F0EDE8] text-base text-right">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-[#888580] mb-3">
                Dostupné barvy
              </p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <div
                    key={color.name}
                    className="w-8 h-8 rounded-full ring-1 ring-white/20 cursor-pointer hover:ring-[#C8A028] transition-all duration-200"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <a
              href="#kontakt"
              onClick={onClose}
              className="inline-flex items-center justify-center px-6 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] transition-colors duration-200 text-center"
            >
              Mám zájem — domluvit konzultaci
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-6 py-4 border border-white/20 text-[#F0EDE8] text-sm tracking-[0.15em] uppercase hover:border-white/40 transition-colors duration-200"
            >
              Zpět na kolekci
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
