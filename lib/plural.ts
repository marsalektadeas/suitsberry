/**
 * České skloňování počtů: 1 / 2–4 / 5+.
 *
 * Tvary si dodává volající, protože správný tvar závisí na pádu ve větě:
 *   1. pád — „1 oblek, 2 obleky, 5 obleků"
 *   4. pád — „Smazat 1 oblek, 2 obleky, 5 obleků"
 * a u jiných slov se pády liší („1 změna" vs. „Zahodit 1 změnu").
 */
export function plural(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  if (count === 1) return forms[0];
  if (count >= 2 && count <= 4) return forms[1];
  return forms[2];
}

/** Počet i se slovem: `withCount(3, ["oblek", "obleky", "obleků"])` → „3 obleky". */
export function withCount(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  return `${count} ${plural(count, forms)}`;
}
