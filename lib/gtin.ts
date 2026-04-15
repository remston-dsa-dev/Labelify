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

/** EAN-8 check digit for first 7 digits (GS1 mod-10). */
export function computeEan8CheckDigit(digits7: string): string {
  if (!/^\d{7}$/.test(digits7)) {
    throw new Error("EAN-8 requires exactly 7 digits before the check digit");
  }
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const n = Number(digits7[i]);
    sum += i % 2 === 0 ? n * 3 : n;
  }
  return String((10 - (sum % 10)) % 10);
}

export function isValidEan8(gtin: string): boolean {
  if (!/^\d{8}$/.test(gtin)) return false;
  try {
    return computeEan8CheckDigit(gtin.slice(0, 7)) === gtin[7];
  } catch {
    return false;
  }
}

export type ResolveEan8Failure = "empty" | "bad_length" | "bad_check";

export function resolveEan8FromInput(input: string):
  | { ok: true; value: string }
  | { ok: false; reason: ResolveEan8Failure } {
  const d = normalizeGtin(input);
  if (d.length === 0) return { ok: false, reason: "empty" };
  if (d.length === 7) {
    return { ok: true, value: d + computeEan8CheckDigit(d) };
  }
  if (d.length === 8) {
    if (isValidEan8(d)) return { ok: true, value: d };
    return { ok: false, reason: "bad_check" };
  }
  return { ok: false, reason: "bad_length" };
}

/** UPC-A check digit for first 11 digits (GTIN-12 / UPC-A). */
export function computeUpcACheckDigit(digits11: string): string {
  if (!/^\d{11}$/.test(digits11)) {
    throw new Error("UPC-A requires exactly 11 digits before the check digit");
  }
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const n = Number(digits11[i]);
    sum += i % 2 === 0 ? n * 3 : n;
  }
  return String((10 - (sum % 10)) % 10);
}

export function isValidUpcA(upc: string): boolean {
  if (!/^\d{12}$/.test(upc)) return false;
  try {
    return computeUpcACheckDigit(upc.slice(0, 11)) === upc[11];
  } catch {
    return false;
  }
}

export type ResolveUpcAFailure = "empty" | "bad_length" | "bad_check";

export function resolveUpcAFromInput(input: string):
  | { ok: true; value: string }
  | { ok: false; reason: ResolveUpcAFailure } {
  const d = normalizeGtin(input);
  if (d.length === 0) return { ok: false, reason: "empty" };
  if (d.length === 11) {
    return { ok: true, value: d + computeUpcACheckDigit(d) };
  }
  if (d.length === 12) {
    if (isValidUpcA(d)) return { ok: true, value: d };
    return { ok: false, reason: "bad_check" };
  }
  return { ok: false, reason: "bad_length" };
}
