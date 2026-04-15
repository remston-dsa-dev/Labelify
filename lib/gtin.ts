/** Strip non-digits and return digits only. */
export function normalizeGtin(input: string): string {
  return input.replace(/\D/g, "");
}

/** Compute EAN-13 check digit for the first 12 digits. */
export function computeEan13CheckDigit(digits12: string): string {
  if (!/^\d{12}$/.test(digits12)) {
    throw new Error("EAN-13 requires exactly 12 digits before the check digit");
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = Number(digits12[i]);
    sum += i % 2 === 0 ? n : n * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

export function isValidEan13(gtin: string): boolean {
  if (!/^\d{13}$/.test(gtin)) return false;
  try {
    return computeEan13CheckDigit(gtin.slice(0, 12)) === gtin[12];
  } catch {
    return false;
  }
}

export type ResolveEan13Failure = "empty" | "bad_length" | "bad_check";

/**
 * For forms and CSV: 12 digits → append EAN-13 check digit; 13 digits → must validate.
 * Many spreadsheets omit the check digit or use a wrong 13th digit.
 */
export function resolveEan13FromInput(input: string):
  | { ok: true; gtin: string }
  | { ok: false; reason: ResolveEan13Failure } {
  const d = normalizeGtin(input);
  if (d.length === 0) return { ok: false, reason: "empty" };
  if (d.length === 12) {
    return { ok: true, gtin: d + computeEan13CheckDigit(d) };
  }
  if (d.length === 13) {
    if (isValidEan13(d)) return { ok: true, gtin: d };
    return { ok: false, reason: "bad_check" };
  }
  return { ok: false, reason: "bad_length" };
}

/** Random valid EAN-13 (internal use; retail may require GS1 prefix). */
export function generateEan13(): string {
  let digits12 = "";
  for (let i = 0; i < 12; i++) {
    digits12 += String(Math.floor(Math.random() * 10));
  }
  return digits12 + computeEan13CheckDigit(digits12);
}
