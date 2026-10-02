const MAX_MINOR = 2_000_000_000; // stays inside Postgres Int (2^31 - 1)

/**
 * "12.5" -> 1250, "12.34" -> 1234. No floats involved.
 * Also reused for percentages: "33.33" -> 3333 basis points (100% = 10000).
 */
export function parseMoneyToMinor(input: string): number | null {
  const s = input.trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ""] = s.split(".");
  const minor = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return minor <= MAX_MINOR ? minor : null;
}

/** UI edge only. */
export function formatMoney(minor: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(minor / 100);
}