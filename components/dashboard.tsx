"use client";

import { signOut } from "@/app/actions/auth";
import { ImportPanel } from "@/components/import-panel";
import { LabelPreview } from "@/components/label-preview";
import { ThemeToggle } from "@/components/theme-toggle";
import { SkuForm } from "@/components/sku-form";
import { SkuList } from "@/components/sku-list";
import type { SkuImportRow, SkuRow } from "@/lib/types/sku";
import { useMemo, useState } from "react";

export function Dashboard({
  initialSkus,
  initialImports,
}: {
  initialSkus: SkuRow[];
  initialImports: SkuImportRow[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importFilterId, setImportFilterId] = useState<string | "">("");

  const filteredSkus = useMemo(() => {
    if (!importFilterId) return initialSkus;
    return initialSkus.filter((s) => s.import_id === importFilterId);
  }, [initialSkus, importFilterId]);

  const effectiveSelectedId = useMemo(() => {
    if (!selectedId) return null;
    return filteredSkus.some((s) => s.id === selectedId) ? selectedId : null;
  }, [filteredSkus, selectedId]);

  const selected = useMemo(
    () =>
      filteredSkus.find((s) => s.id === effectiveSelectedId) ?? null,
    [filteredSkus, effectiveSelectedId],
  );

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <header className="no-print flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Labelify
          </h1>
          <p className="text-xs text-muted-foreground">
            SKUs and barcode labels
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Print label
          </button>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(22vh,28vh)_minmax(0,1fr)_minmax(28vh,38vh)] gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:grid-rows-1">
        <section className="no-print flex min-h-0 flex-col border-b border-border bg-card md:border-b-0 md:border-r">
          <ImportPanel imports={initialImports} />
          <div className="shrink-0 border-b border-border px-3 py-2">
            <h2 className="text-sm font-medium text-foreground">
              SKUs
            </h2>
            <label className="mt-2 block text-xs text-muted-foreground">
              Filter by import
              <select
                value={importFilterId}
                onChange={(e) => {
                  setImportFilterId(e.target.value);
                  setSelectedId(null);
                }}
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value="">All SKUs ({initialSkus.length})</option>
                {initialImports.map((imp) => (
                  <option key={imp.id} value={imp.id}>
                    {imp.filename} ({imp.row_count})
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing {filteredSkus.length} of {initialSkus.length}
            </p>
          </div>
          <SkuList
            skus={filteredSkus}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
          />
        </section>

        <section className="flex min-h-0 flex-col overflow-y-auto border-b border-border bg-muted/50 p-4 md:border-b-0 md:overflow-y-auto">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
            <LabelPreview sku={selected} className="w-full" />
          </div>
        </section>

        <section className="no-print flex min-h-0 flex-col overflow-y-auto border-border bg-card p-4 md:border-l">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-foreground">
              {selected ? "Edit SKU" : "New SKU"}
            </h2>
            {selected ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
              >
                New SKU
              </button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1">
            <SkuForm
              key={selected?.id ?? "new"}
              selected={selected}
              onCreatedSelect={(id) => setSelectedId(id)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
