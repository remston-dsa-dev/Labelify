"use client";

import {
  createSku,
  deleteSku,
  generateNextGtin,
  updateSku,
} from "@/app/actions/skus";
import { centsToInputString, parsePriceToCents } from "@/lib/money";
import type { SkuRow } from "@/lib/types/sku";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  selected: SkuRow | null;
  onCreatedSelect: (id: string) => void;
};

export function SkuForm({ selected, onCreatedSelect }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [gtin, setGtin] = useState(() => selected?.gtin ?? "");
  const [name, setName] = useState(() => selected?.name ?? "");
  const [lot, setLot] = useState(() => selected?.lot ?? "");
  const [priceInput, setPriceInput] = useState(() =>
    selected ? centsToInputString(selected.price_cents) : "0.00",
  );
  const [logoUrl, setLogoUrl] = useState(() => selected?.logo_url ?? "");

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("gtin", gtin);
    fd.set("name", name);
    fd.set("lot", lot);
    const cents = parsePriceToCents(priceInput);
    if (cents === null) {
      throw new Error("Invalid price");
    }
    fd.set("price_cents", String(cents));
    fd.set("logo_url", logoUrl);
    return fd;
  }

  function handleGenerateGtin() {
    startTransition(async () => {
      setError(null);
      const r = await generateNextGtin();
      if (r.error) {
        setError(r.error);
        return;
      }
      if (r.gtin) setGtin(r.gtin);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      let fd: FormData;
      try {
        fd = buildFormData();
      } catch {
        setError("Enter a valid price.");
        return;
      }
      if (selected) {
        const res = await updateSku(selected.id, fd);
        if ("error" in res && res.error) setError(res.error);
        else router.refresh();
      } else {
        const res = await createSku(fd);
        if (!("ok" in res) || !res.ok) {
          setError("error" in res ? res.error : "Could not create SKU.");
          return;
        }
        onCreatedSelect(res.id);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!selected) return;
    if (!confirm("Delete this SKU? This cannot be undone.")) return;
    startTransition(async () => {
      setError(null);
      const res = await deleteSku(selected.id);
      if ("error" in res && res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="gtin"
            className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            EAN-13 (GTIN)
          </label>
          <input
            id="gtin"
            name="gtin"
            inputMode="numeric"
            autoComplete="off"
            maxLength={13}
            value={gtin}
            onChange={(e) => setGtin(e.target.value.replace(/\D/g, "").slice(0, 13))}
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 font-mono text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="13 digits"
            required
          />
        </div>
        <button
          type="button"
          onClick={handleGenerateGtin}
          disabled={pending}
          className="shrink-0 rounded-md border border-zinc-300 bg-zinc-100 px-2 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-200 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          Generate
        </button>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Retail packaging often needs a GS1-registered prefix. Generated codes are
        valid EAN-13 for internal use.
      </p>
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Product name
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          required
        />
      </div>
      <div>
        <label
          htmlFor="lot"
          className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Lot (optional)
        </label>
        <input
          id="lot"
          name="lot"
          value={lot}
          onChange={(e) => setLot(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label
          htmlFor="price"
          className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Price (USD)
        </label>
        <input
          id="price"
          name="price"
          inputMode="decimal"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
      <div>
        <label
          htmlFor="logo_url"
          className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Logo URL (optional)
        </label>
        <input
          id="logo_url"
          name="logo_url"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="https://…"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {selected ? "Save changes" : "Add SKU"}
        </button>
        {selected ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
