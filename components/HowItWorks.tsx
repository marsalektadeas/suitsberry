const steps = [
  {
    step: "1",
    title: "Kontaktujte nás",
    text: "Napište nám nebo zavolejte. Bezplatná konzultace, žádné závazky.",
  },
  {
    step: "2",
    title: "Vybereme váš styl",
    text: "Společně najdeme oblek, který sedí vašemu charakteru i příležitosti.",
  },
  {
    step: "3",
    title: "Získáte dojem",
    text: "Obdržíte oblek, ve kterém budete působit sebevědomě a reprezentativně.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-36 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left */}
          <div className="md:sticky md:top-32">
            <h2
              className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Tři kroky
              <br />k dokonalému
              <br />
              <em className="not-italic text-[#C8A028]">dojmu.</em>
            </h2>
          </div>

          {/* Steps */}
          <div className="flex flex-col">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className={`group py-10 flex gap-8 items-start cursor-default ${
                  i < steps.length - 1 ? "border-b border-white/8" : ""
                }`}
              >
                <span
                  className="text-[3.5rem] font-light text-[#C8A028]/55 group-hover:text-[#C8A028] leading-none mt-1 select-none transition-colors duration-300"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  {item.step}
                </span>
                <div>
                  <h3
                    className="text-2xl md:text-3xl font-light text-white group-hover:text-[#C8A028] mb-2 transition-colors duration-300"
                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[#A09C97] leading-relaxed text-base">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
