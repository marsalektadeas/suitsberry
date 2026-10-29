"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import type { Product } from "@/data/products";
import { requestEnquiry } from "@/lib/enquiry";
import AddToCart from "./cart/AddToCart";
import { useCart } from "./cart/CartProvider";

const calcProgress = (el: HTMLElement) => {
  const max = el.scrollHeight - el.clientHeight;
  return max > 0 ? el.scrollTop / max : 1;
};

const isAtBottom = (progress: number) => progress >= 0.98;

/**
 * Sleduje, kolik detailu je doscrollováno. Přepočítává se i při změně velikosti
 * obsahu (rozbalení technických detailů, otočení mobilu) — jinak by hint
 * „Více o produktu" svítil i tam, kde není kam scrollovat.
 */
function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(1);

  const update = useCallback(() => {
    if (ref.current) setProgress(calcProgress(ref.current));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [update]);

  return { ref, progress, update };
}

type Props = {
  product: Product;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const {
    ref: mobileDetailsRef,
    progress: mobileProgress,
    update: updateMobileProgress,
  } = useScrollProgress();
  const {
    ref: desktopDetailsRef,
    progress: desktopProgress,
    update: updateDesktopProgress,
  } = useScrollProgress();
  const closeRef = useRef<HTMLButtonElement>(null);

  const { openCart } = useCart();

  const showCart = () => {
    onClose();
    openCart();
  };

  const handleEnquire = () => {
    requestEnquiry({
      productName: product.name,
      productColor: product.colors[0]?.name,
    });
    onClose();
    requestAnimationFrame(() => {
      document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
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
    { label: "Střih", value: product.specs.strih },
    { label: "Zapínání", value: product.specs.zapinani },
    { label: "Vzor", value: product.specs.vzor },
    { label: "Materiál", value: product.specs.material },
    { label: "Velikosti", value: product.specs.velikosti },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} — detail obleku`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button — always on top, always visible */}
      <button
        ref={closeRef}
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
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", maxHeight: "45vh" }}
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
        <div className="relative flex-1 min-h-0 flex">
          {/* Scroll progress bar */}
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/8 z-10">
            <div
              className="w-full bg-[#C8A028] transition-all duration-100"
              style={{ height: `${mobileProgress * 100}%` }}
            />
          </div>
          {/* Bottom fade + scroll hint */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 z-10 transition-opacity duration-300 flex items-end justify-center pb-2"
            style={{
              background: "linear-gradient(to top, #141414 40%, transparent 100%)",
              opacity: isAtBottom(mobileProgress) ? 0 : 1,
            }}
          >
            <button
              onClick={() => mobileDetailsRef.current?.scrollBy({ top: 120, behavior: "smooth" })}
              tabIndex={isAtBottom(mobileProgress) ? -1 : 0}
              className={`flex items-center gap-1.5 text-[#C8A028] text-xs tracking-[0.2em] uppercase ${isAtBottom(mobileProgress) ? "" : "pointer-events-auto"}`}
            >
              Více o produktu
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 7l4 4 4-4" stroke="#C8A028" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        <div
          ref={mobileDetailsRef}
          onScroll={updateMobileProgress}
          className="overflow-y-auto flex-1 p-6 flex flex-col gap-4 pr-5"
        >
          <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase">
            {product.category}
          </p>
          <h2
            className="text-4xl font-light text-white leading-tight"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {product.name}
          </h2>
          <p className="text-[#A09C97] leading-relaxed text-sm">
            {product.description}
          </p>
          <p className="text-[#C8A028] text-sm tracking-[0.2em] uppercase">
            {product.occasion}
          </p>
          <div>
            <button
              onClick={() => setSpecsOpen((v) => !v)}
              className="w-full flex items-center justify-between py-3 border-t border-white/8 text-left"
              aria-expanded={specsOpen}
            >
              <span className="text-sm tracking-[0.2em] uppercase text-[#A09C97]">
                Technické detaily
              </span>
              <span
                className={`text-[#C8A028] text-lg leading-none transition-transform duration-300 ${
                  specsOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                specsOpen ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="flex flex-col pt-1">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between py-2.5 border-b border-white/8"
                  >
                    <span className="text-[#A09C97] text-sm">{spec.label}</span>
                    <span className="text-[#F0EDE8] text-sm text-right">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* CTA — always visible at bottom */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-white/8">
          <AddToCart product={product} onShowCart={showCart} onEnquire={handleEnquire} />
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
        <div className="w-[35%] flex flex-col overflow-hidden">
          {/* Scrollable content */}
          <div className="relative flex-1 min-h-0 flex">
            {/* Scroll progress bar */}
            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/8 z-10">
              <div
                className="w-full bg-[#C8A028] transition-all duration-100"
                style={{ height: `${desktopProgress * 100}%` }}
              />
            </div>
            {/* Bottom fade + scroll hint */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 z-10 transition-opacity duration-300 flex items-end justify-center pb-2"
              style={{
                background: "linear-gradient(to top, #141414 40%, transparent 100%)",
                opacity: isAtBottom(desktopProgress) ? 0 : 1,
              }}
            >
              <button
                onClick={() => desktopDetailsRef.current?.scrollBy({ top: 120, behavior: "smooth" })}
                tabIndex={isAtBottom(desktopProgress) ? -1 : 0}
                className={`flex items-center gap-1.5 text-[#C8A028] text-xs tracking-[0.2em] uppercase ${isAtBottom(desktopProgress) ? "" : "pointer-events-auto"}`}
              >
                Více o produktu
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 7l4 4 4-4" stroke="#C8A028" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          <div
            ref={desktopDetailsRef}
            onScroll={updateDesktopProgress}
            className="overflow-y-auto flex-1 p-8 xl:p-10 flex flex-col gap-5"
          >
            <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase">
              {product.category}
            </p>
            <h2
              className="text-4xl xl:text-5xl font-light text-white leading-tight"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {product.name}
            </h2>
            <p className="text-[#A09C97] leading-relaxed text-base">
              {product.description}
            </p>
            <p className="text-[#C8A028] text-sm tracking-[0.2em] uppercase">
              {product.occasion}
            </p>

            {product.colors.length > 0 && (
              <div>
                <p className="text-sm tracking-[0.2em] uppercase text-[#A09C97] mb-3">
                  Dostupné barvy
                </p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <div
                      key={color.name}
                      className="w-8 h-8 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <button
                onClick={() => setSpecsOpen((v) => !v)}
                className="w-full flex items-center justify-between py-3 border-t border-white/8 text-left"
                aria-expanded={specsOpen}
              >
                <span className="text-sm tracking-[0.2em] uppercase text-[#A09C97]">
                  Technické detaily
                </span>
                <span
                  className={`text-[#C8A028] text-lg leading-none transition-transform duration-300 ${
                    specsOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  specsOpen ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="flex flex-col pt-1">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between py-3 border-b border-white/8"
                    >
                      <span className="text-[#A09C97] text-base">{spec.label}</span>
                      <span className="text-[#F0EDE8] text-base text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* CTA — always visible at bottom */}
          <div className="flex-shrink-0 p-8 xl:p-10 pt-6 border-t border-white/8">
            <AddToCart product={product} onShowCart={showCart} onEnquire={handleEnquire} />
          </div>
        </div>
      </div>

    </div>
  );
}
