type Props = {
  className?: string;
};

/** Ujištění u nákupu: oblek, který nesedí, vyměníme zdarma. */
export default function FreeExchangeNote({ className = "" }: Props) {
  return (
    <p className={`flex items-start gap-2 text-sm leading-relaxed text-[#A09C97] ${className}`}>
      <span className="text-[#C8A028]" aria-hidden="true">↺</span>
      <span>
        <span className="text-[#F0EDE8]">Výměna zdarma.</span> Když vám oblek nesedne, vyměníme ho.
      </span>
    </p>
  );
}
