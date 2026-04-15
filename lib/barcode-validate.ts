import { getBarcodeFormatDef, isSupportedBarcodeFormatId } from "@/lib/barcode-formats";
import {
  normalizeGtin,
  resolveEan13FromInput,
  resolveEan8FromInput,
  resolveUpcAFromInput,
} from "@/lib/gtin";

const MAX_PAYLOAD = 4096;

/** Map CSV / human labels to internal `barcode_format` ids. */
export function normalizeBarcodeFormatSlug(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const compact = t.toLowerCase().replace(/\s+/g, "").replace(/_/g, "-");
  const aliased: Record<string, string> = {
    ean13: "ean13",
    "ean-13": "ean13",
    gtin13: "ean13",
    gtin: "ean13",
    ean: "ean13",
    ean8: "ean8",
    "ean-8": "ean8",
    upca: "upca",
    upc: "upca",
    "upc-a": "upca",
    qr: "qrcode",
    qrcode: "qrcode",
    "qr-code": "qrcode",
    datamatrix: "datamatrix",
    "data-matrix": "datamatrix",
    dm: "datamatrix",
    gs1128: "gs1-128",
    "gs1-128": "gs1-128",
    gs128: "gs1-128",
    code128: "code128",
    code39: "code39",
    code93: "code93",
    pdf417: "pdf417",
    aztec: "azteccode",
    "aztec-code": "azteccode",
    azteccode: "azteccode",
    itf: "interleaved2of5",
    i25: "interleaved2of5",
    i2of5: "interleaved2of5",
    codabar: "codabar",
    code25: "code2of5",
  };
  if (aliased[compact]) return aliased[compact];
  if (isSupportedBarcodeFormatId(compact)) return compact;
  if (isSupportedBarcodeFormatId(t)) return t;
  return null;
}

export type ValidateBarcodeError = string;

export function validateBarcodePayload(
  formatId: string,
  rawValue: string,
): { ok: true; value: string } | { ok: false; error: ValidateBarcodeError } {
  if (!isSupportedBarcodeFormatId(formatId)) {
    return { ok: false, error: "Unsupported barcode type." };
  }
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter the data to encode." };
  }

  switch (formatId) {
    case "ean13": {
      const r = resolveEan13FromInput(trimmed);
      if (!r.ok) {
        if (r.reason === "empty") return { ok: false, error: "Enter EAN-13 digits." };
        if (r.reason === "bad_length") {
          return { ok: false, error: "EAN-13 needs 12 or 13 digits." };
        }
        return { ok: false, error: "Invalid EAN-13 check digit; use 12 digits to auto-fill." };
      }
      return { ok: true, value: r.gtin };
    }
    case "ean8": {
      const r = resolveEan8FromInput(trimmed);
      if (!r.ok) {
        if (r.reason === "empty") return { ok: false, error: "Enter EAN-8 digits." };
        if (r.reason === "bad_length") {
          return { ok: false, error: "EAN-8 needs 7 or 8 digits." };
        }
        return { ok: false, error: "Invalid EAN-8 check digit." };
      }
      return { ok: true, value: r.value };
    }
    case "upca": {
      const r = resolveUpcAFromInput(trimmed);
      if (!r.ok) {
        if (r.reason === "empty") return { ok: false, error: "Enter UPC-A digits." };
        if (r.reason === "bad_length") {
          return { ok: false, error: "UPC-A needs 11 or 12 digits." };
        }
        return { ok: false, error: "Invalid UPC-A check digit." };
      }
      return { ok: true, value: r.value };
    }
    case "interleaved2of5": {
      const d = normalizeGtin(trimmed);
      if (d.length < 2) return { ok: false, error: "ITF needs at least 2 digits." };
      if (d.length % 2 !== 0) {
        return { ok: false, error: "ITF needs an even number of digits." };
      }
      return { ok: true, value: d };
    }
    default:
      break;
  }

  if (trimmed.length > MAX_PAYLOAD) {
    return { ok: false, error: `Data is too long (max ${MAX_PAYLOAD} characters).` };
  }
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(trimmed)) {
    return { ok: false, error: "Data contains invalid characters." };
  }

  return { ok: true, value: trimmed };
}

export function formatValidationHint(formatId: string): string | undefined {
  const def = getBarcodeFormatDef(formatId);
  if (!def) return undefined;
  switch (formatId) {
    case "ean13":
      return "12 or 13 digits (EAN-13 / GTIN-13).";
    case "ean8":
      return "7 or 8 digits (EAN-8).";
    case "upca":
      return "11 or 12 digits (UPC-A).";
    case "interleaved2of5":
      return "Even number of digits.";
    default:
      return def.family === "2d"
        ? "Paste or type the full string to encode."
        : "Enter characters allowed by this symbology.";
  }
}
