import { DEFAULT_BARCODE_FORMAT_ID } from "@/lib/barcode-formats";
import {
  normalizeBarcodeFormatSlug,
  validateBarcodePayload,
} from "@/lib/barcode-validate";
import { parsePriceToCents } from "@/lib/money";

export type ParsedSkuRow = {
  barcode_format: string;
  gtin: string;
  name: string;
  lot: string | null;
  price_cents: number;
  logo_url: string | null;
};

export type RowParseError = {
  line: number;
  message: string;
};

/** Normalize CSV / spreadsheet header keys to lowercase trimmed. */
export function normalizeHeaders(row: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.trim().toLowerCase();
    out[key] = v == null ? "" : String(v).trim();
  }
  return out;
}

/**
 * Expected columns (case-insensitive): gtin (or equivalent), name, optional barcode_format,
 * lot, price, logo_url
 */
export function parseSkuFromCsvRow(
  raw: Record<string, unknown>,
  line: number,
): { ok: true; value: ParsedSkuRow } | { ok: false; error: RowParseError } {
  const row = normalizeHeaders(raw);

  const formatRaw =
    row.barcode_format ??
    row.format ??
    row.symbology ??
    row.bcid ??
    row.type ??
    "";
  const trimmedFormat = formatRaw.trim();
  const formatSlug = trimmedFormat
    ? normalizeBarcodeFormatSlug(formatRaw)
    : DEFAULT_BARCODE_FORMAT_ID;

  if (trimmedFormat && !formatSlug) {
    return {
      ok: false,
      error: {
        line,
        message: `Unknown barcode_format “${trimmedFormat}”. Use an id from the template (e.g. ean13, qrcode).`,
      },
    };
  }

  const barcode_format: string = trimmedFormat ? formatSlug! : DEFAULT_BARCODE_FORMAT_ID;

  const gtinRaw =
    row.gtin ?? row.ean ?? row.barcode ?? row.upc ?? row.payload ?? row.data ?? "";
  const name = row.name ?? row.product ?? row.title ?? "";

  const validated = validateBarcodePayload(barcode_format, gtinRaw);
  if (!validated.ok) {
    return {
      ok: false,
      error: { line, message: validated.error },
    };
  }

  const gtin = validated.value;

  const nameTrim = name.trim();
  if (!nameTrim) {
    return {
      ok: false,
      error: { line, message: "Missing product name." },
    };
  }

  const lot = (row.lot ?? "").trim() || null;
  const priceRaw = row.price ?? row.price_usd ?? "";
  const priceCents = parsePriceToCents(priceRaw);
  if (priceCents === null) {
    return {
      ok: false,
      error: { line, message: "Invalid price." },
    };
  }

  let logoUrl: string | null = (row.logo_url ?? row.logo ?? "").trim() || null;
  if (logoUrl) {
    try {
      const u = new URL(logoUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        logoUrl = null;
      }
    } catch {
      return {
        ok: false,
        error: { line, message: "Invalid logo_url." },
      };
    }
  }

  return {
    ok: true,
    value: {
      barcode_format,
      gtin,
      name: nameTrim,
      lot,
      price_cents: priceCents,
      logo_url: logoUrl,
    },
  };
}
