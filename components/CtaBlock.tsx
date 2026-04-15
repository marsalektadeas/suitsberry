"use client";

import Image from "next/image";
import { useState } from "react";

export default function CtaBlock() {
  const [active, setActive] = useState(false);

  return (
    <section className="bg-[#111111] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-0 items-stretch md:min-h-[560px]">
          {/* Left — text */}
          <div className="flex flex-col justify-center py-20 md:py-24 md:pr-16">
            <h2
              className="text-[3rem] md:text-[4rem] leading-[1.05] font-light mb-8 transition-colors duration-300"
              style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                color: active ? "#C8A028" : "#ffffff",
              }}
            >
              Připraveni
              <br />
              <em className="not-italic">změnit dojem?</em>
            </h2>
            <p className="text-[#A09C97] text-base leading-relaxed mb-10 max-w-sm">
              Nezávazná konzultace je zdarma. Stačí napsat — ozveme se do 24 hodin.
            </p>
            <a
              href="#kontakt"
              className="self-start inline-flex items-center px-8 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#D4AF40] transition-colors duration-200"
              onMouseEnter={() => setActive(true)}
              onMouseLeave={() => setActive(false)}
            >
              Poptat oblek
            </a>
          </div>

          {/* Right — two stacked photos */}
          <div className="hidden md:grid grid-cols-2 gap-3 py-12">
            <div className="relative overflow-hidden">
              <Image
                src="/products/green/hero.jpg"
                alt="Suitsberry kolekce"
                fill
                className="object-cover object-top"
                sizes="20vw"
              />
            </div>
            <div className="relative overflow-hidden">
              <Image
                src="/products/blue/hero.jpg"
                alt="Suitsberry kolekce"
                fill
                className="object-cover object-top"
                sizes="20vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
