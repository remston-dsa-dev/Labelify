"use client";

import { formatUsd } from "@/lib/money";
import type { SkuRow } from "@/lib/types/sku";
import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

type Props = {
  sku: SkuRow | null;
  className?: string;
};

export function LabelPreview({ sku, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !sku?.gtin) return;
    try {
      el.innerHTML = "";
      JsBarcode(el, sku.gtin, {
        format: "EAN13",
        width: 1.8,
        height: 56,
        displayValue: true,
        fontSize: 14,
        margin: 8,
        background: "transparent",
        lineColor: "#0a0a0a",
      });
    } catch {
      el.innerHTML = "";
    }
  }, [sku?.gtin]);

  if (!sku) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground ${className ?? ""}`}
      >
        Select or create a SKU to preview the label.
      </div>
    );
  }

  const trace = [sku.gtin ? `GTIN: ${sku.gtin}` : null, sku.lot ? `Lot: ${sku.lot}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={`label-print-area flex flex-col items-center rounded-xl border border-border bg-white p-6 text-zinc-950 shadow-sm ring-1 ring-black/5 dark:ring-white/10 ${className ?? ""}`}
    >
      <div className="flex w-full max-w-[320px] flex-col items-center gap-3 text-center">
        {sku.logo_url ? (
          <div className="relative h-14 w-full max-w-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sku.logo_url}
              alt=""
              className="mx-auto max-h-14 max-w-full object-contain"
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div className="flex h-12 w-full max-w-[200px] items-center justify-center rounded border border-dashed border-zinc-300 text-xs text-zinc-500">
            Logo (optional)
          </div>
        )}
        <h2 className="text-balance text-lg font-semibold leading-snug text-zinc-900">
          {sku.name}
        </h2>
        {trace ? (
          <p className="text-xs text-zinc-600">{trace}</p>
        ) : null}
        <div className="w-full overflow-hidden rounded-md bg-white py-1">
          <svg ref={svgRef} className="mx-auto block h-auto w-full max-w-[280px]" />
        </div>
        <p className="text-xl font-semibold tabular-nums text-zinc-900">
          {formatUsd(sku.price_cents)}
        </p>
      </div>
    </div>
  );
}
