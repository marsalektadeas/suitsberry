"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Jak probíhá konzultace?",
    a: "Konzultace je bezplatná a probíhá online nebo osobně. Popíšete nám příležitost, svůj styl a preference — my vám doporučíme správný oblek, střih a barvu. Žádné závazky, žádný tlak.",
  },
  {
    q: "Jaké velikosti jsou dostupné?",
    a: "Naše obleky jsou dostupné ve velikostech 46 až 66. Pokud si nejste jistí svou velikostí, poradíme vám při konzultaci — stačí znát obvod hrudníku a výšku.",
  },
  {
    q: "Jak dlouho trvá dodání?",
    a: "Standardní dodací lhůta je 5–10 pracovních dní od potvrzení objednávky. U vybraných modelů na skladě doručíme rychleji. Přesný termín sdělíme po konzultaci.",
  },
  {
    q: "Nabízíte úpravy obleku?",
    a: "Ano. Ke každému obleku doporučujeme spolupracovat s lokálním krejčím pro drobné úpravy délky rukávů nebo kalhot. Na vyžádání vám doporučíme osvědčené krejčí ve vašem městě.",
  },
  {
    q: "Je možné oblek vrátit nebo vyměnit?",
    a: "Záleží na konkrétní situaci — kontaktujte nás a vyřešíme to individuálně. Záleží nám na tom, abyste byli spokojení, a vždy hledáme rozumné řešení.",
  },
  {
    q: "Jak vybrat správný střih?",
    a: "Slim fit sedí atletičtějším postavám a působí moderně. Regular fit je pohodlnější a vhodný pro širší ramena nebo složitější postavu. Pokud nevíte, poradíme vám při konzultaci.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left — heading */}
          <div className="md:sticky md:top-32">
            <h2
              className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white mb-6"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Máte
              <br />
              <em className="not-italic text-[#C8A028]">otázky?</em>
            </h2>
            <p className="text-[#A09C97] text-base leading-relaxed max-w-sm">
              Nejčastější dotazy na jednom místě. Nezodpovězeno? Napište nám —
              odpovíme do 24 hodin.
            </p>
          </div>

          {/* Right — accordion */}
          <div className="flex flex-col">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-t border-white/10"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-7 text-left group"
                  aria-expanded={open === i}
                >
                  <span
                    className="text-base font-light text-white group-hover:text-[#C8A028] transition-colors duration-200"
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`text-[#C8A028] text-xl leading-none mt-1 flex-shrink-0 transition-transform duration-300 ${
                      open === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    open === i ? "max-h-64 pb-7" : "max-h-0"
                  }`}
                >
                  <p className="text-[#A09C97] text-base leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t border-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
