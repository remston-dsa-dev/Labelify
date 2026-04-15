import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParseRowsResult =
  | { ok: true; rows: Record<string, unknown>[] }
  | { ok: false; error: string; details?: string };

function nonEmptyRow(r: Record<string, unknown>): boolean {
  return Object.values(r).some((v) => String(v ?? "").trim() !== "");
}

/** First sheet of .xlsx / .xls / .xlsb → array of row objects (header row = keys). */
export async function parseExcelToRows(file: File): Promise<ParseRowsResult> {
  let workbook: XLSX.WorkBook;
  try {
    const buf = await file.arrayBuffer();
    workbook = XLSX.read(buf, { type: "array" });
  } catch {
    return { ok: false, error: "Could not read Excel file." };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { ok: false, error: "Excel file has no sheets." };
  }
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { ok: false, error: "Could not read the first worksheet." };
  }

  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
    blankrows: false,
  });

  return { ok: true, rows: json };
}

export function parseCsvTextToRows(text: string): ParseRowsResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0) {
    return {
      ok: false,
      error: "Could not parse CSV.",
      details: parsed.errors.map((e) => e.message).join("; "),
    };
  }

  const rows = parsed.data.filter(nonEmptyRow) as Record<string, unknown>[];
  return { ok: true, rows };
}

export function isExcelFileName(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.endsWith(".xlsx") || n.endsWith(".xls") || n.endsWith(".xlsb")
  );
}

/** Parse CSV text or Excel binary from a File. */
export async function parseRowsFromUpload(file: File): Promise<ParseRowsResult> {
  if (isExcelFileName(file.name)) {
    const result = await parseExcelToRows(file);
    if (!result.ok) return result;
    const rows = result.rows.filter(nonEmptyRow);
    return { ok: true, rows };
  }

  const text = await file.text();
  const result = parseCsvTextToRows(text);
  if (!result.ok) return result;
  const rows = result.rows.filter(nonEmptyRow);
  return { ok: true, rows };
}
