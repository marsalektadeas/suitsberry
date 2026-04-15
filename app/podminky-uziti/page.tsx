import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Podmínky užití — Suitsberry",
  description:
    "Podmínky užití webu Suitsberry — pravidla pro používání stránek suitsberry.cz.",
  alternates: {
    canonical: "https://suitsberry.cz/podminky-uziti",
  },
};

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-36">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase text-[#A09C97] hover:text-[#C8A028] transition-colors duration-200 mb-16"
        >
          <span>←</span> Zpět na web
        </Link>

        <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-4">
          Právní dokumenty
        </p>
        <h1
          className="text-[2.8rem] md:text-[3.5rem] leading-[1.1] font-light text-white mb-12"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Podmínky<br />
          <em className="not-italic text-[#C8A028]">užití</em>
        </h1>

        <div className="space-y-10 text-[#A09C97] text-base leading-relaxed">
          <section>
            <h2 className="text-white text-xl font-light mb-3">
              1. Provozovatel webu
            </h2>
            <p>
              Provozovatelem webu <strong className="text-[#F0EDE8]">suitsberry.cz</strong> je
              společnost Suitsberry. Kontakt: <strong className="text-[#F0EDE8]">+420 731 152 421</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              2. Účel webu
            </h2>
            <p>
              Tento web slouží výhradně jako prezentační stránka značky Suitsberry.
              Neprobíhá zde prodej zboží prostřednictvím e-shopu. Veškeré poptávky
              jsou zpracovávány individuálně na základě kontaktního formuláře.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              3. Používání webu
            </h2>
            <p>
              Obsah tohoto webu — texty, fotografie, grafické prvky a design — je
              chráněn autorským právem. Jakékoli kopírování, šíření nebo jiné užití
              bez předchozího písemného souhlasu provozovatele je zakázáno.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              4. Kontaktní formulář
            </h2>
            <p>
              Odesláním kontaktního formuláře vyjadřujete zájem o nezávaznou
              konzultaci. Odesláním formuláře nevzniká žádný smluvní vztah ani
              závazek. Suitsberry si vyhrazuje právo na poptávku nereagovat bez
              udání důvodu.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              5. Přesnost informací
            </h2>
            <p>
              Informace na tomto webu jsou poskytovány v dobré víře a mohou být
              kdykoliv změněny bez předchozího upozornění. Suitsberry neodpovídá za
              případné chyby nebo neaktuálnost obsahu.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              6. Odkazy na třetí strany
            </h2>
            <p>
              Web může obsahovat odkazy na externí stránky. Suitsberry neodpovídá
              za obsah ani dostupnost těchto stránek a jejich provozování se řídí
              vlastními podmínkami.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              7. Změny podmínek
            </h2>
            <p>
              Provozovatel si vyhrazuje právo tyto podmínky kdykoli upravit.
              Aktuální verze je vždy dostupná na této stránce. Dalším používáním
              webu po změně podmínek vyjadřujete souhlas s jejich novou verzí.
            </p>
          </section>

          <p className="text-sm text-[#555] pt-6 border-t border-white/8">
            Platné od: dubna 2025 · suitsberry.cz
          </p>
        </div>
      </div>
    </div>
  );
}
