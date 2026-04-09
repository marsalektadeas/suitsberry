const currentYear = new Date().getFullYear();

const footerLinks = [
  { label: "O nás", href: "#o-nas" },
  { label: "Kolekce", href: "#kolekce" },
  { label: "Proč my", href: "#proc-my" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] py-16 md:py-20 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Top */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12 pb-12 border-b border-white/8">
          <div className="flex flex-col gap-1">
            <a
              href="#"
              className="text-2xl tracking-[0.25em] font-light text-white"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              SUITSBERRY
            </a>
            <p
              className="text-[#444] text-sm tracking-[0.35em] uppercase"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Tailored for distinction
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 md:gap-8">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm tracking-[0.2em] uppercase text-[#444] hover:text-[#C8A028] transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="text-[#444] text-base space-y-1">
            <p>+420 731 152 421</p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-[#333] text-sm">
            © {currentYear} Suitsberry. Všechna práva vyhrazena.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm tracking-[0.1em] uppercase text-[#333] hover:text-[#888580] transition-colors duration-200">
              Ochrana osobních údajů
            </a>
            <a href="#" className="text-sm tracking-[0.1em] uppercase text-[#333] hover:text-[#888580] transition-colors duration-200">
              Podmínky užití
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
