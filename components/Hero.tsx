"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Hero() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative h-screen min-h-[640px] flex overflow-hidden bg-[#0A0A0A]">
      {/* Image — starts below fixed header so model head is visible */}
      <div className="absolute inset-x-0 bottom-0 top-16 md:top-20">
        <Image
          src="/hero.png"
          alt="Suitsberry — prémiový pánský oblek"
          fill
          priority
          unoptimized
          className="object-cover object-[55%_top]"
          sizes="100vw"
        />
        {/* Fade left → dark for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/75 md:via-[#0A0A0A]/50 to-transparent" />
        {/* Fade bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
        {/* Mobile: stronger overlay */}
        <div className="absolute inset-0 bg-[#0A0A0A]/50 md:hidden" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 flex items-end md:items-center pb-20 md:pb-0 w-full">
        <div
          ref={textRef}
          style={{
            opacity: 0,
            transform: "translateY(32px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
          className="max-w-xl"
        >
          <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-6">
            Prémiové pánské obleky
          </p>

          <h1
            className="text-[2.8rem] sm:text-[3.5rem] md:text-[5rem] leading-[1.05] font-light text-white mb-6"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Oblek,
            <br />
            který mluví
            <br />
            <em className="not-italic text-[#C8A028]">za vás.</em>
          </h1>

          <p className="text-[#888580] text-base md:text-lg font-light leading-relaxed mb-10 max-w-md">
            Prémiové pánské obleky pro muže, kteří chtějí zanechat
            správný dojem — na každé příležitosti.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#kontakt"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#D4AF40] transition-colors duration-200"
            >
              Nezávazně poptat
            </a>
            <a
              href="#kolekce"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white text-sm tracking-[0.2em] uppercase hover:border-white/50 transition-colors duration-200"
            >
              Prohlédnout kolekci
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-sm tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-white/20 animate-pulse" />
      </div>
    </section>
  );
}
