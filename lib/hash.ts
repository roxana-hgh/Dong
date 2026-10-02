/** Small stable string hash (for picking avatar colors / cover variants). */
export function stableHash(input: string): number {
  let h = 0;
  for (const ch of input) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h;
}