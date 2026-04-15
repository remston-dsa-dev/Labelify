"use client";

import { LabelCard } from "@/components/label-card";
import type { SkuRow } from "@/lib/types/sku";
import Link from "next/link";

type Props = {
  skus: SkuRow[];
  importFilename: string;
};

export function BatchPrintView({ skus, importFilename }: Props) {
  return (
    <div className="min-h-dvh bg-background text-foreground print:min-h-0">
      <header className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Print labels</h1>
          <p className="text-xs text-muted-foreground">
            {importFilename} · {skus.length} label{skus.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/app"
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            Back to app
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
          >
            Print
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-md space-y-10 p-6 print:space-y-0 print:p-4">
        {skus.map((sku, i) => (
          <div
            key={sku.id}
            className={
              i < skus.length - 1
                ? "batch-label-page pb-10 print:pb-0"
                : undefined
            }
          >
            <LabelCard sku={sku} className="w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
