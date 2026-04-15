import { resolveEan13FromInput } from "@/lib/gtin";
import { parsePriceToCents } from "@/lib/money";

export type ParsedSkuRow = {
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
 * Expected columns (case-insensitive): gtin, name, lot (optional), price (optional), logo_url (optional)
 */
export function parseSkuFromCsvRow(
  raw: Record<string, unknown>,
  line: number,
): { ok: true; value: ParsedSkuRow } | { ok: false; error: RowParseError } {
  const row = normalizeHeaders(raw);

  const gtinRaw =
    row.gtin ?? row.ean ?? row.barcode ?? row.upc ?? "";
  const name = row.name ?? row.product ?? row.title ?? "";

  const resolved = resolveEan13FromInput(gtinRaw);
  if (!resolved.ok) {
    const msg =
      resolved.reason === "empty"
        ? "Missing gtin (or barcode/ean column)."
        : resolved.reason === "bad_length"
          ? "GTIN must be 12 or 13 digits (EAN-13)."
          : "Wrong EAN-13 check digit (last digit); fix it or enter 12 digits and we add the check digit.";
    return {
      ok: false,
      error: { line, message: msg },
    };
  }
  const gtin = resolved.gtin;

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
      gtin,
      name: nameTrim,
      lot,
      price_cents: priceCents,
      logo_url: logoUrl,
    },
  };
}
