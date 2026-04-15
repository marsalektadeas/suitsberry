"use client";

import { useEffect, useRef } from "react";

const reasons = [
  {
    number: "01",
    title: "Prémiové materiály",
    text: "Každý oblek vychází z vybraných látek — vlna, viskóza, polyamid s lycrou. Nosíte kvalitu, která je cítit i vidět.",
  },
  {
    number: "02",
    title: "Osobní přístup",
    text: "Poradíme vám s výběrem. Vy popíšete příležitost a charakter, my postaráme se o zbytek.",
  },
  {
    number: "03",
    title: "Dokonalý střih",
    text: "Slim fit i regular fit varianty navržené tak, aby seděly. Žádné kompromisy ve střihu ani v detailu.",
  },
  {
    number: "04",
    title: "Pro každou příležitost",
    text: "Business, svatba, večírek nebo gala. Máme oblek, ve kterém budete vždy na správném místě.",
  },
];

export default function WhySuitsberry() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLDivElement>(".reason-card");

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
    <section id="proc-my" className="py-24 md:py-36 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-20">
          <h2
            className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white max-w-2xl"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Proč muži
            <br />
            <em className="not-italic text-[#C8A028]">volí Suitsberry.</em>
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
        >
          {reasons.map((reason) => (
            <div
              key={reason.number}
              className="reason-card group border-t border-white/10 pt-8 cursor-default"
              style={{
                opacity: 0,
                transform: "translateY(40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <p
                className="text-[#C8A028]/60 group-hover:text-[#C8A028] text-4xl font-light mb-6 transition-colors duration-300"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {reason.number}
              </p>
              <h3 className="text-white group-hover:text-[#C8A028] text-lg font-light tracking-wide mb-3 transition-colors duration-300">
                {reason.title}
              </h3>
              <p className="text-[#A09C97] text-base leading-relaxed">
                {reason.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
