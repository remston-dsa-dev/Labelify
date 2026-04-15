"use client";

import { signOut } from "@/app/actions/auth";
import { LabelPreview } from "@/components/label-preview";
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
      <header className="no-print flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Labelify
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            SKUs and EAN-13 labels
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Print label
          </button>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(22vh,28vh)_minmax(0,1fr)_minmax(28vh,38vh)] gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:grid-rows-1">
        <section className="no-print flex min-h-0 flex-col border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:border-b-0 md:border-r">
          <div className="shrink-0 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              SKUs
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {initialSkus.length} total
            </p>
          </div>
          <SkuList
            skus={initialSkus}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
          />
        </section>

        <section className="flex min-h-0 flex-col overflow-y-auto border-b border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/80 md:border-b-0 md:overflow-y-auto">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
            <LabelPreview sku={selected} className="w-full" />
          </div>
        </section>

        <section className="no-print flex min-h-0 flex-col overflow-y-auto border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:border-l">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {selected ? "Edit SKU" : "New SKU"}
            </h2>
            {selected ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
