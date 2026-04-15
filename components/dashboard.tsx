"use client";

import { signOut } from "@/app/actions/auth";
import { LabelPreview } from "@/components/label-preview";
import { ThemeToggle } from "@/components/theme-toggle";
import { SkuForm } from "@/components/sku-form";
import { SkuList } from "@/components/sku-list";
import type { SkuRow } from "@/lib/types/sku";
import { useMemo, useState } from "react";

export function Dashboard({ initialSkus }: { initialSkus: SkuRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const effectiveSelectedId = useMemo(() => {
    if (!selectedId) return null;
    return initialSkus.some((s) => s.id === selectedId) ? selectedId : null;
  }, [initialSkus, selectedId]);

  const selected = useMemo(
    () =>
      initialSkus.find((s) => s.id === effectiveSelectedId) ?? null,
    [initialSkus, effectiveSelectedId],
  );

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <header className="no-print flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Labelify
          </h1>
          <p className="text-xs text-muted-foreground">
            SKUs and EAN-13 labels
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
          <div className="shrink-0 border-b border-border px-3 py-2">
            <h2 className="text-sm font-medium text-foreground">
              SKUs
            </h2>
            <p className="text-xs text-muted-foreground">
              {initialSkus.length} total
            </p>
          </div>
          <SkuList
            skus={initialSkus}
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
