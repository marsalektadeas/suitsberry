/** Oblekové velikosti jdou po dvou (46, 48, 50…). */
const SIZE_STEP = 2;
const MAX_RANGE_SPAN = 60;
const RANGE_PATTERN = /^(\d{2,3})\s*[–-]\s*(\d{2,3})$/;

/**
 * Převede text z parametru „Velikosti“ na seznam pro výběr v košíku.
 * Umí rozsah („46 – 66“ → 46, 48 … 66) i výčet („48, 50, 52“ nebo „S, M, L“).
 */
export function parseSizes(spec: string): string[] {
  const trimmed = spec.trim();
  const range = trimmed.match(RANGE_PATTERN);

  if (range) {
    const from = Number(range[1]);
    const to = Number(range[2]);
    if (from > to || to - from > MAX_RANGE_SPAN) return [];
    const sizes: string[] = [];
    for (let size = from; size <= to; size += SIZE_STEP) sizes.push(String(size));
    return sizes;
  }

  return trimmed
    .split(/[,;]/)
    .map((size) => size.trim())
    .filter(Boolean);
}
