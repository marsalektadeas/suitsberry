"use client";

import { useEffect, useRef } from "react";

// ⚠️ PLACEHOLDER — nahraď reálnými referencemi klientů.
const testimonials = [
  {
    quote:
      "Poprvé jsem měl pocit, že oblek sedí přesně mně. Na svatbě se mě ptali, kde jsem ho sehnal.",
    author: "Martin K.",
    context: "Svatba",
  },
  {
    quote:
      "Profesionální přístup od první zprávy. Poradili mi se střihem i barvou — výsledek předčil očekávání.",
    author: "Tomáš R.",
    context: "Business",
  },
  {
    quote:
      "Konečně oblek, ve kterém působím sebevědomě, aniž bych o tom musel přemýšlet. Přesně to jsem hledal.",
    author: "Jakub V.",
    context: "Společenská událost",
  },
];

export default function Testimonials() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLDivElement>(".testimonial-card");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            }, i * 150);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 md:py-36 bg-[#0A0A0A] border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Heading */}
        <div className="mb-16 md:mb-20">
          <h2
            className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white max-w-2xl"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Muži, kteří už
            <br />
            <em className="not-italic text-[#C8A028]">udělali dojem.</em>
          </h2>
        </div>

        {/* Quotes */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12"
        >
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="testimonial-card group border-t border-white/10 pt-8"
              style={{
                opacity: 0,
                transform: "translateY(40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <span
                className="block text-[#C8A028]/50 text-5xl leading-none mb-5 select-none"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote
                className="text-[#F0EDE8]/90 text-xl md:text-2xl font-light leading-relaxed mb-8"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="w-6 h-px bg-[#C8A028]" />
                <span className="text-[#F0EDE8] text-sm">{t.author}</span>
                <span className="text-[#A09C97] text-sm tracking-[0.15em] uppercase">
                  · {t.context}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
