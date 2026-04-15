import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseSkuFromCsvRow } from "@/lib/csv-import";
import type { ParsedSkuRow } from "@/lib/csv-import";
import { parseRowsFromUpload } from "@/lib/import-rows";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 5000;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 400 },
    );
  }

  const parsed = await parseRowsFromUpload(file);

  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, details: parsed.details },
      { status: 400 },
    );
  }

  const { rows } = parsed;

  if (rows.length === 0) {
    return NextResponse.json({ error: "File has no data rows" }, { status: 400 });
  }

  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows (max ${MAX_ROWS})` },
      { status: 400 },
    );
  }

  const rowErrors: { line: number; message: string }[] = [];
  const staged: { line: number; value: ParsedSkuRow }[] = [];
  const lineBase = 2;

  for (let i = 0; i < rows.length; i++) {
    const line = lineBase + i;
    const result = parseSkuFromCsvRow(rows[i]!, line);
    if (!result.ok) {
      rowErrors.push(result.error);
    } else {
      staged.push({ line, value: result.value });
    }
  }

  const seenGtin = new Set<string>();
  const deduped: ParsedSkuRow[] = [];
  for (const { line, value } of staged) {
    if (seenGtin.has(value.gtin)) {
      rowErrors.push({ line, message: `Duplicate GTIN in file: ${value.gtin}` });
      continue;
    }
    seenGtin.add(value.gtin);
    deduped.push(value);
  }

  if (deduped.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        inserted: 0,
        rowErrors,
        message: "No valid rows after deduplication.",
      },
      { status: 422 },
    );
  }

  const { data: existingRows } = await supabase
    .from("skus")
    .select("gtin")
    .eq("user_id", user.id)
    .in(
      "gtin",
      deduped.map((r) => r.gtin),
    );

  const existingSet = new Set((existingRows ?? []).map((r) => r.gtin));

  const gtinLine = new Map<string, number>();
  for (const { line, value } of staged) {
    if (!gtinLine.has(value.gtin)) gtinLine.set(value.gtin, line);
  }

  const toInsert: ParsedSkuRow[] = [];
  for (const value of deduped) {
    if (existingSet.has(value.gtin)) {
      rowErrors.push({
        line: gtinLine.get(value.gtin) ?? 0,
        message: `GTIN already in account: ${value.gtin}`,
      });
      continue;
    }
    toInsert.push(value);
  }

  if (toInsert.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        inserted: 0,
        rowErrors,
        message: "No new SKUs imported (all rows invalid or duplicates).",
      },
      { status: 422 },
    );
  }

  const insertedCount = toInsert.length;
  const failedCount = rowErrors.length;

  let status: "completed" | "partial" | "failed";
  if (failedCount > 0) {
    status = "partial";
  } else {
    status = "completed";
  }

  const errorSummary =
    failedCount > 0
      ? `${failedCount} row(s) skipped (${rowErrors.slice(0, 3).map((e) => e.message).join("; ")}${failedCount > 3 ? "…" : ""})`
      : null;

  const { data: importRow, error: importErr } = await supabase
    .from("sku_imports")
    .insert({
      user_id: user.id,
      filename: file.name || "import.csv",
      row_count: insertedCount,
      status,
      error_summary: errorSummary,
    })
    .select("id")
    .single();

  if (importErr || !importRow) {
    return NextResponse.json(
      { error: importErr?.message ?? "Failed to create import record" },
      { status: 500 },
    );
  }

  if (toInsert.length > 0) {
    const payload = toInsert.map((r) => ({
      user_id: user.id,
      import_id: importRow.id,
      gtin: r.gtin,
      name: r.name,
      lot: r.lot,
      price_cents: r.price_cents,
      logo_url: r.logo_url,
    }));

    const { error: insertErr } = await supabase.from("skus").insert(payload);

    if (insertErr) {
      await supabase.from("sku_imports").delete().eq("id", importRow.id);
      return NextResponse.json(
        { error: insertErr.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    importId: importRow.id,
    inserted: insertedCount,
    rowErrors,
    status,
  });
}
