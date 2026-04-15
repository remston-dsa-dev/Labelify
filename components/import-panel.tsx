"use client";

import type { SkuImportRow } from "@/lib/types/sku";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Props = {
  imports: SkuImportRow[];
};

type RowErr = { line: number; message: string };

export function ImportPanel({ imports }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<RowErr[] | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    setRowErrors(null);
    const fd = new FormData();
    fd.set("file", file);
    try {
      const res = await fetch("/api/imports", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        inserted?: number;
        message?: string;
        error?: string;
        rowErrors?: { line: number; message: string }[];
      };
      if (!res.ok) {
        setError(data.error ?? data.message ?? "Import failed");
        if (data.rowErrors?.length) setRowErrors(data.rowErrors);
        return;
      }
      if (data.ok) {
        if (data.rowErrors && data.rowErrors.length > 0) {
          setRowErrors(data.rowErrors);
        }
        const extra =
          data.rowErrors && data.rowErrors.length > 0
            ? ` — ${data.rowErrors.length} row(s) skipped (see below).`
            : "";
        setMessage(`Imported ${data.inserted ?? 0} SKU(s)${extra}`);
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4 border-b border-border px-3 py-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          CSV / Excel import
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Columns: <span className="font-mono text-foreground">gtin</span>,{" "}
          <span className="font-mono text-foreground">name</span>, optional{" "}
          <span className="font-mono">lot</span>,{" "}
          <span className="font-mono">price</span>,{" "}
          <span className="font-mono">logo_url</span>. Use{" "}
          <strong className="text-foreground">12 or 13 digits</strong> for EAN-13
          (12 digits get a valid check digit automatically). Wrong 13th digit
          is rejected. In Excel, format GTIN cells as{" "}
          <strong className="text-foreground">Text</strong> so leading zeros are
          kept.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={onFile}
        disabled={busy}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-md border border-border bg-background px-2 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          {busy ? "Importing…" : "Upload CSV or Excel"}
        </button>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <a
            href="/sku-import-template.csv"
            download="labelify-sku-import-template.csv"
            className="flex flex-1 items-center justify-center rounded-md border border-border bg-muted/50 px-2 py-2 text-center text-sm font-medium text-foreground hover:bg-muted"
          >
            CSV template
          </a>
          <a
            href="/sku-import-template.xlsx"
            download="labelify-sku-import-template.xlsx"
            className="flex flex-1 items-center justify-center rounded-md border border-border bg-muted/50 px-2 py-2 text-center text-sm font-medium text-foreground hover:bg-muted"
          >
            Excel template
          </a>
        </div>
      </div>
      {message ? (
        <p className="text-xs text-green-700 dark:text-green-400">{message}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {rowErrors && rowErrors.length > 0 ? (
        <div
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-2 dark:bg-amber-500/15"
          role="status"
        >
          <p className="text-xs font-medium text-amber-950 dark:text-amber-100">
            Skipped rows ({rowErrors.length})
          </p>
          <ul className="mt-1 max-h-40 list-inside list-disc space-y-0.5 overflow-y-auto text-[11px] leading-snug text-amber-950/90 dark:text-amber-50/90">
            {rowErrors.map((r, i) => (
              <li key={i}>
                {r.line > 0 ? (
                  <span className="font-mono">Line {r.line}: </span>
                ) : null}
                {r.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {imports.length > 0 ? (
        <div>
          <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">
            Recent uploads
          </h4>
          <ul className="max-h-40 space-y-1.5 overflow-y-auto text-xs">
            {imports.slice(0, 8).map((imp) => (
              <li
                key={imp.id}
                className="flex flex-col gap-0.5 rounded border border-border/60 bg-muted/30 px-2 py-1.5"
              >
                <span className="truncate font-medium text-foreground" title={imp.filename}>
                  {imp.filename}
                </span>
                <span className="text-muted-foreground">
                  {imp.row_count} SKU · {imp.status}
                </span>
                {imp.row_count > 0 ? (
                  <Link
                    href={`/app/print/import/${imp.id}`}
                    className="text-foreground underline hover:no-underline"
                  >
                    Print all labels
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
