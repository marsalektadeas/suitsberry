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
  return (
    <section id="proc-my" className="py-24 md:py-36 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-20">
          <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-4">
            Proč Suitsberry
          </p>
          <h2
            className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white max-w-2xl"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            Čtyři důvody, proč
            <br />
            <em className="not-italic text-[#C8A028]">nás volí ti správní.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {reasons.map((reason) => (
            <div key={reason.number} className="border-t border-white/10 pt-8">
              <p
                className="text-[#C8A028]/30 text-4xl font-light mb-6"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
              >
                {reason.number}
              </p>
              <h3 className="text-white text-lg font-light tracking-wide mb-3">
                {reason.title}
              </h3>
              <p className="text-[#888580] text-base leading-relaxed">
                {reason.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
