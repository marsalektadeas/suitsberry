"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";

type Props = {
  product: Product;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const scrollToImage = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: "smooth" });
    setActiveImage(index);
  };

  const onCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveImage(index);
  };

  const specs = [
    { label: "Barva", value: product.specs.barva },
    { label: "Střih", value: product.specs.strich },
    { label: "Zapínání", value: product.specs.zapinani },
    { label: "Vzor", value: product.specs.vzor },
    { label: "Materiál", value: product.specs.material },
    { label: "Velikosti", value: product.specs.velikosti },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button — always on top, always visible */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] w-10 h-10 flex items-center justify-center bg-[#141414] border border-white/40 text-white hover:border-white transition-colors duration-200"
        aria-label="Zavřít"
      >
        ✕
      </button>

      {/* ── MOBILE modal (full screen) ── */}
      <div className="md:hidden relative z-10 w-full h-full bg-[#141414] flex flex-col overflow-hidden">
        {/* Carousel */}
        <div className="relative flex-shrink-0">
          <div
            ref={carouselRef}
            onScroll={onCarouselScroll}
            className="flex overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", maxHeight: "52vh" }}
          >
            {product.images.map((img, i) => (
              <div
                key={i}
                className="relative w-full flex-shrink-0 snap-start bg-[#0A0A0A]"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToImage(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImage === i
                      ? "bg-[#C8A028] w-5"
                      : "bg-white/40 w-1.5"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details — scrollable */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-4">
          <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase">
            {product.category}
          </p>
          <h2
            className="text-4xl font-light text-white leading-tight"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {product.name}
          </h2>
          <p className="text-[#888580] leading-relaxed text-sm">
            {product.description}
          </p>
          <div className="flex flex-col">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between py-2.5 border-b border-white/8"
              >
                <span className="text-[#888580] text-sm">{spec.label}</span>
                <span className="text-[#F0EDE8] text-sm text-right">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 mt-2 pb-8">
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

      {/* ── DESKTOP modal (centered, max height) ── */}
      <div className="hidden md:flex relative z-10 w-full max-w-5xl bg-[#141414] overflow-hidden max-h-[88vh]">
        {/* Left — images (65%) */}
        <div className="w-[65%] flex-shrink-0 flex flex-col min-h-0">
          <div className="relative flex-1 min-h-0 bg-[#0A0A0A]">
            <Image
              src={product.images[activeImage] ?? product.heroImage}
              alt={product.name}
              fill
              className="object-contain"
              sizes="65vw"
              priority
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3 bg-[#0F0F0F] overflow-x-auto flex-shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-14 flex-shrink-0 overflow-hidden transition-all duration-200 ${
                    activeImage === i
                      ? "ring-1 ring-[#C8A028]"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  style={{ height: "4.5rem" }}
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

        {/* Right — details (35%) */}
        <div className="w-[35%] overflow-y-auto p-8 xl:p-10 flex flex-col gap-5">
          <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase">
            {product.category}
          </p>
          <h2
            className="text-4xl xl:text-5xl font-light text-white leading-tight"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {product.name}
          </h2>
          <p className="text-[#888580] leading-relaxed text-base">
            {product.description}
          </p>
          <div className="w-full h-px bg-white/8" />
          <div className="flex flex-col">
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

          <div className="flex flex-col gap-3 mt-auto pt-4">
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
