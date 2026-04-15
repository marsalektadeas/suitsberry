"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function About() {
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Parallax on image
  useEffect(() => {
    const wrap = imgWrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const handleScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const viewH = window.innerHeight;
      // progress: -1 (above) → 0 (center) → 1 (below)
      const progress = (viewH / 2 - (rect.top + rect.height / 2)) / viewH;
      img.style.transform = `translateY(${progress * 60}px) scale(1.08)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Word-by-word reveal on heading
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          heading.querySelectorAll<HTMLSpanElement>(".word").forEach((word, i) => {
            word.style.transitionDelay = `${i * 120}ms`;
            word.style.opacity = "1";
            word.style.transform = "translateY(0)";
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  const words = ["Nejde", "jen", "o", "oblek."];

  return (
    <section id="o-nas" className="py-24 md:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Image with parallax */}
          <div ref={imgWrapRef} className="relative order-2 md:order-1">
            <div className="relative aspect-[3/4] overflow-hidden">
              <div
                ref={imgRef}
                className="absolute inset-0 will-change-transform"
                style={{ transition: "transform 0.1s linear" }}
              >
                <Image
                  src="/products/slim-fit/hero.jpg"
                  alt="Suitsberry — filozofie značky"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            {/* Decorative */}
            <div className="hidden md:block absolute -bottom-6 -right-6 w-40 h-40 border border-[#C8A028]/20 -z-10" />
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <h2
              ref={headingRef}
              className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white mb-8 overflow-hidden"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              {words.map((word, i) => (
                <span key={i} className="inline-block mr-[0.25em]">
                  <span
                    className="word inline-block"
                    style={{
                      opacity: 0,
                      transform: "translateY(40px)",
                      transition: "opacity 0.7s ease, transform 0.7s ease",
                    }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h2>

            <div className="space-y-5 text-[#A09C97] leading-relaxed">
              <p>
                Je to o pocitu, když vstoupíte do místnosti a víte, že vypadáte
                správně. O sebevědomí, které nepotřebuje slova. O detailu, který
                ostatní zaregistrují, aniž by věděli proč.
              </p>
              <p>
                Suitsberry vznikla pro muže, kterým záleží na tom, jak působí.
                Vybíráme každý detail — střih, materiál, výraz. Protože dojem,
                který zanecháte, se počítá.
              </p>
            </div>

            <div className="group mt-10 flex items-center gap-6 cursor-default">
              <div className="w-10 h-px bg-[#C8A028]/50 group-hover:bg-[#C8A028] transition-colors duration-300" />
              <p
                className="text-[#F0EDE8]/90 group-hover:text-[#C8A028] text-2xl md:text-3xl italic font-light transition-colors duration-300"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                „Styl není luxus. Je to nezbytnost."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
