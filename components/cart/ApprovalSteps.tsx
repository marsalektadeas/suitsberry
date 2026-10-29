const STEPS = [
  "Odešlete objednávku. Nic neplatíte.",
  "Objednávku schválíme a do 24 hodin vám zavoláme.",
  "Domluvíme platbu, dopravu a případně doladíme velikost.",
];

/** Zákazník musí před odesláním vědět, že nejde o hotový nákup — nejdřív schvalujeme. */
export default function ApprovalSteps({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-[#C8A028]/30 bg-[#C8A028]/5 p-5 ${className}`}>
      <p className="text-[#C8A028] text-xs tracking-[0.25em] uppercase mb-3">
        Jak to proběhne
      </p>
      <ol className="space-y-2">
        {STEPS.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-[#A09C97]">
            <span className="text-[#C8A028]">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
