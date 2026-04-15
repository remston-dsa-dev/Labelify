"use client";

import type { SkuRow } from "@/lib/types/sku";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

type Props = {
  skus: SkuRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SkuList({ skus, selectedId, onSelect }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Virtual returns unstable function refs; safe here as virtual list root only.
  /* eslint-disable react-hooks/incompatible-library -- TanStack Virtual */
  const rowVirtualizer = useVirtualizer({
    count: skus.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 12,
  });
  /* eslint-enable react-hooks/incompatible-library */

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto">
      {skus.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No SKUs yet. Add one using the form.
        </p>
      ) : (
        <div
          className="relative w-full"
          style={{ height: rowVirtualizer.getTotalSize() }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const sku = skus[virtualRow.index];
            if (!sku) return null;
            const active = sku.id === selectedId;
            return (
              <button
                key={sku.id}
                type="button"
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={`absolute left-0 top-0 w-full border-b border-zinc-100 px-3 py-2 text-left text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 ${
                  active
                    ? "bg-zinc-200/80 dark:bg-zinc-800/80"
                    : "bg-transparent"
                }`}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
                onClick={() => onSelect(sku.id)}
              >
                <span className="block truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {sku.name}
                </span>
                <span className="block truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  {sku.gtin}
                </span>
              </button>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
