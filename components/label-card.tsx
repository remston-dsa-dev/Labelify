"use client";

import {
  DEFAULT_BARCODE_FORMAT_ID,
  getBarcodeFormatDef,
} from "@/lib/barcode-formats";
import { formatUsd } from "@/lib/money";
import type { SkuRow } from "@/lib/types/sku";
import bwipjs from "bwip-js/browser";
import { useEffect, useRef, useState } from "react";

type Props = {
  sku: SkuRow;
  className?: string;
};

/** Single label tile: product fields + barcode image (bwip-js / BWIPP). */
export function LabelCard({ sku, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [encodeErr, setEncodeErr] = useState<string | null>(null);

  const fmtId = sku.barcode_format ?? DEFAULT_BARCODE_FORMAT_ID;

  useEffect(() => {
    const canvas = canvasRef.current;
    const def =
      getBarcodeFormatDef(fmtId) ??
      getBarcodeFormatDef(DEFAULT_BARCODE_FORMAT_ID)!;
    if (!canvas || !sku.gtin) return;
    try {
      const is2d = def.family === "2d";
      bwipjs.toCanvas(canvas, {
        bcid: def.bcid,
        text: sku.gtin,
        scale: is2d ? 2 : 2,
        height: is2d ? undefined : 12,
        includetext: true,
        textsize: is2d ? 7 : 10,
        textxalign: "center",
        backgroundcolor: "ffffff",
        barcolor: "000000",
        textcolor: "000000",
      });
      queueMicrotask(() => setEncodeErr(null));
    } catch (e) {
      // Sync feedback after bwip-js encode (external canvas API)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- encode error display
      setEncodeErr(e instanceof Error ? e.message : "Could not encode barcode.");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [sku.gtin, fmtId]);

  const label =
    getBarcodeFormatDef(fmtId)?.label ?? sku.barcode_format ?? "Barcode";

  const trace = [
    sku.gtin ? `Format: ${label}` : null,
    sku.lot ? `Lot: ${sku.lot}` : null,
  ]
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
        {trace ? <p className="text-xs text-zinc-600">{trace}</p> : null}
        <div className="w-full overflow-hidden rounded-md bg-white py-1">
          {encodeErr ? (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
              {encodeErr}
            </p>
          ) : null}
          <canvas
            ref={canvasRef}
            className="mx-auto max-h-[min(360px,50vh)] w-full max-w-[280px]"
          />
        </div>
        <p className="text-xl font-semibold tabular-nums text-zinc-900">
          {formatUsd(sku.price_cents)}
        </p>
      </div>
    </div>
  );
}
