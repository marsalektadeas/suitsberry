/**
 * Jednoduchý limit pokusů v paměti. Na Vercelu má každá instance vlastní
 * paměť, takže je to brzda proti hloupým botům, ne neprůstřelná ochrana.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }

    if (entry.count >= limit) return true;

    entry.count++;
    return false;
  };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
