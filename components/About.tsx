import Image from "next/image";

export default function About() {
  return (
    <section id="o-nas" className="py-24 md:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Image */}
          <div className="relative order-2 md:order-1">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/products/camel/hero.jpg"
                alt="Suitsberry — filozofie značky"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decorative */}
            <div className="hidden md:block absolute -bottom-6 -right-6 w-40 h-40 border border-[#C8A028]/20 -z-10" />
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-6">
              O značce
            </p>
            <h2
              className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white mb-8"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Nejde jen
              <br />o oblek.
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
                className="text-[#F0EDE8]/70 group-hover:text-[#C8A028] text-lg italic font-light transition-colors duration-300"
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
