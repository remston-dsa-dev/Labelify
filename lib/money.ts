export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Parse "4.99" or "4" to integer cents; empty -> 0 */
export function parsePriceToCents(input: string): number | null {
  const t = input.trim();
  if (t === "") return 0;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function centsToInputString(cents: number): string {
  return (cents / 100).toFixed(2);
}
