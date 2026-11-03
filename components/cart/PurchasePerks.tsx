const PERKS = [
  { title: "Doprava zdarma" },
  { title: "Výměna zdarma,", detail: "když oblek nesedne" },
];

/** Ujištění pod tlačítkem „Přidat do košíku“: co zákazník dostane navíc. */
export default function PurchasePerks() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs leading-relaxed text-[#A09C97]">
      {PERKS.map((perk) => (
        <li key={perk.title} className="flex items-start gap-2">
          <span className="text-[#C8A028]" aria-hidden="true">✓</span>
          <span>
            <span className="text-[#F0EDE8]">{perk.title}</span>
            {perk.detail && ` ${perk.detail}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
