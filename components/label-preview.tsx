"use client";

import { LabelCard } from "@/components/label-card";
import type { SkuRow } from "@/lib/types/sku";

type Props = {
  sku: SkuRow | null;
  className?: string;
};

export function LabelPreview({ sku, className }: Props) {
  if (!sku) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground ${className ?? ""}`}
      >
        Select or create a SKU to preview the label.
      </div>
    );
  }

  return <LabelCard sku={sku} className={className} />;
}
