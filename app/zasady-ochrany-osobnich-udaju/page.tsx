import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zásady ochrany osobních údajů — Suitsberry",
  description:
    "Informace o zpracování osobních údajů a používání souborů cookie na webu Suitsberry.",
  alternates: {
    canonical: "https://suitsberry.cz/zasady-ochrany-osobnich-udaju",
  },
};

export default function PrivacyPolicy() {
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
          Zásady ochrany<br />
          <em className="not-italic text-[#C8A028]">osobních údajů</em>
        </h1>

        <div className="space-y-10 text-[#A09C97] text-base leading-relaxed">
          <section>
            <h2 className="text-white text-xl font-light mb-3">
              1. Správce osobních údajů
            </h2>
            <p>
              Správcem osobních údajů je společnost Suitsberry, provozovatel
              webu <strong className="text-[#F0EDE8]">suitsberry.cz</strong>.
              Kontaktní telefon: <strong className="text-[#F0EDE8]">+420 731 152 421</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              2. Jaké údaje zpracováváme
            </h2>
            <p>
              Zpracováváme pouze údaje, které nám sami poskytnete prostřednictvím
              kontaktního formuláře: jméno, e-mailová adresa, telefonní číslo a
              obsah zprávy. Tyto údaje jsou zpracovávány výhradně za účelem
              odpovědi na vaši poptávku.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              3. Právní základ zpracování
            </h2>
            <p>
              Zpracování probíhá na základě vašeho souhlasu (čl. 6 odst. 1 písm.
              a) GDPR), který udělíte zaškrtnutím příslušného políčka ve
              formuláři. Souhlas lze kdykoli odvolat zasláním e-mailu nebo
              telefonicky.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              4. Soubory cookie
            </h2>
            <p>
              Tento web nepoužívá analytické ani marketingové cookies. Používáme
              pouze technicky nezbytné soubory cookie, které zajišťují správné
              fungování webu (např. uložení vašeho souhlasu s cookies). Tyto
              soubory cookie nevyžadují váš souhlas.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              5. Doba uchovávání
            </h2>
            <p>
              Osobní údaje z formuláře uchováváme pouze po dobu nezbytnou pro
              vyřízení vaší poptávky, nejdéle 1 rok. Poté jsou trvale vymazány.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              6. Vaše práva
            </h2>
            <p>
              Máte právo na přístup ke svým údajům, jejich opravu, výmaz,
              omezení zpracování a přenositelnost. Máte také právo podat stížnost
              u Úřadu pro ochranu osobních údajů (uoou.cz).
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-light mb-3">
              7. Třetí strany
            </h2>
            <p>
              Vaše údaje nepředáváme třetím stranám ani je nepoužíváme pro
              marketingové účely bez vašeho výslovného souhlasu.
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
