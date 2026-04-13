"use client";

import { useEffect, useState } from "react";

type CookiePrefs = {
  analytical: boolean;
  marketing: boolean;
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    analytical: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const save = (accepted: CookiePrefs) => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({ technical: true, ...accepted, timestamp: Date.now() })
    );
    setVisible(false);
    setModalOpen(false);
  };

  const acceptAll = () => save({ analytical: true, marketing: true });
  const acceptSelected = () => save(prefs);

  if (!visible) return null;

  return (
    <>
      {/* Bottom banner */}
      {!modalOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[200] bg-[#141414] border-t border-white/8 px-6 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[#A09C97] text-sm leading-relaxed max-w-2xl">
              Používáme soubory cookie pro zajištění funkčnosti webu. Více informací v{" "}
              <a
                href="/zasady-ochrany-osobnich-udaju"
                className="text-[#C8A028] underline hover:text-[#D4AF40] transition-colors duration-200"
              >
                zásadách ochrany osobních údajů
              </a>
              .
            </p>
            <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => save({ analytical: false, marketing: false })}
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-white/20 text-[#F0EDE8] text-sm tracking-[0.15em] uppercase hover:border-white/40 transition-colors duration-200"
                >
                  Odmítnout
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] transition-colors duration-200"
                >
                  Přijmout vše
                </button>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs tracking-[0.15em] uppercase text-[#555] hover:text-[#A09C97] transition-colors duration-200 text-center sm:text-left"
              >
                Nastavit předvolby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141414] border border-white/8 p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <h2
                className="text-2xl font-light text-white"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                Nastavení cookies
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#A09C97] hover:text-white transition-colors duration-200 ml-4 mt-1"
                aria-label="Zavřít"
              >
                ✕
              </button>
            </div>
            <p className="text-[#A09C97] text-sm mb-8">
              Upravte si cookies dle vlastních preferencí.
            </p>

            {/* Categories */}
            <div className="space-y-0 mb-8">
              {/* Technical — always on */}
              <CookieRow
                title="Technické cookies"
                description="Nezbytné pro správné fungování webu."
                enabled={true}
                locked
              />
              {/* Analytical */}
              <CookieRow
                title="Analytické cookies"
                description="Pomáhají nám zlepšovat kvalitu webu."
                enabled={prefs.analytical}
                onChange={(v) => setPrefs((p) => ({ ...p, analytical: v }))}
              />
              {/* Marketing */}
              <CookieRow
                title="Reklamní cookies"
                description="Používány pro personalizaci reklamy."
                enabled={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>

            <p className="text-xs text-[#555] mb-6">
              Podrobné informace o zpracování cookies najdete v naší{" "}
              <a
                href="/zasady-ochrany-osobnich-udaju"
                className="text-[#C8A028] underline hover:text-[#D4AF40] transition-colors duration-200"
              >
                zásadách ochrany osobních údajů
              </a>
              .
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptSelected}
                className="flex-1 px-5 py-3 border border-white/20 text-[#F0EDE8] text-sm tracking-[0.15em] uppercase hover:border-white/40 transition-colors duration-200"
              >
                Souhlasím s vybranými
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-5 py-3 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] transition-colors duration-200"
              >
                Souhlasím se všemi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type CookieRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
};

function CookieRow({ title, description, enabled, locked, onChange }: CookieRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-white/8">
      <div>
        <p className="text-[#F0EDE8] text-sm font-medium mb-0.5">{title}</p>
        <p className="text-[#A09C97] text-xs leading-relaxed">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        disabled={locked}
        onClick={() => onChange?.(!enabled)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 mt-0.5 ${
          locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        } ${enabled ? "bg-[#C8A028]" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
