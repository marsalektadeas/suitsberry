"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { label: "O nás", href: "#o-nas", id: "o-nas" },
  { label: "Kolekce", href: "#kolekce", id: "kolekce" },
  { label: "Proč my", href: "#proc-my", id: "proc-my" },
  { label: "Kontakt", href: "#kontakt", id: "kontakt" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;

      setScrolled(scrollY > 40);
      setScrollProgress(docH > 0 ? (scrollY / docH) * 100 : 0);

      // Scroll spy
      let current = "";
      for (const link of navLinks) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = link.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/8"
          : "bg-[#0A0A0A]"
      }`}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-[#C8A028] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a
          href="#"
          className="text-xl md:text-2xl tracking-[0.25em] font-light text-white"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          SUITSBERRY
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm tracking-[0.15em] uppercase transition-colors duration-200 ${
                activeSection === link.id
                  ? "text-[#C8A028]"
                  : "text-[#A09C97] hover:text-[#C8A028]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#kontakt"
          className="hidden md:inline-flex items-center px-5 py-2.5 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4AF40] transition-colors duration-200"
        >
          Poptat oblek
        </a>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Otevřít menu"
        >
          <span className={`block w-6 h-px bg-white transition-transform duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block w-6 h-px bg-white transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-white transition-transform duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/8 px-6 py-8 flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-base tracking-[0.15em] uppercase transition-colors duration-200 ${
                activeSection === link.id ? "text-[#C8A028]" : "text-[#F0EDE8]"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#kontakt"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center px-5 py-3 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.15em] uppercase font-medium"
          >
            Poptat oblek
          </a>
        </div>
      )}
    </header>
  );
}
