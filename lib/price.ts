const czkFormat = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  maximumFractionDigits: 0,
});

/** `12900` → „12 900 Kč“. */
export function formatCzk(amount: number): string {
  return czkFormat.format(amount);
}
