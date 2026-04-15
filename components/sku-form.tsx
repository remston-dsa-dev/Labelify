"use client";

import {
  createSku,
  deleteSku,
  generateNextGtin,
  updateSku,
} from "@/app/actions/skus";
import {
  BARCODE_FORMAT_GROUPS,
  DEFAULT_BARCODE_FORMAT_ID,
  getBarcodeFormatDef,
} from "@/lib/barcode-formats";
import { formatValidationHint } from "@/lib/barcode-validate";
import { centsToInputString, parsePriceToCents } from "@/lib/money";
import type { SkuRow } from "@/lib/types/sku";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  selected: SkuRow | null;
  onCreatedSelect: (id: string) => void;
};

function digitsOnly(v: string, max: number) {
  return v.replace(/\D/g, "").slice(0, max);
}

export function SkuForm({ selected, onCreatedSelect }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [barcodeFormat, setBarcodeFormat] = useState(
    () => selected?.barcode_format ?? DEFAULT_BARCODE_FORMAT_ID,
  );
  const [gtin, setGtin] = useState(() => selected?.gtin ?? "");
  const [name, setName] = useState(() => selected?.name ?? "");
  const [lot, setLot] = useState(() => selected?.lot ?? "");
  const [priceInput, setPriceInput] = useState(() =>
    selected ? centsToInputString(selected.price_cents) : "0.00",
  );
  const [logoUrl, setLogoUrl] = useState(() => selected?.logo_url ?? "");

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("barcode_format", barcodeFormat);
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

  function onPayloadChange(v: string) {
    if (
      barcodeFormat === "ean13" ||
      barcodeFormat === "ean8" ||
      barcodeFormat === "upca" ||
      barcodeFormat === "interleaved2of5"
    ) {
      const max =
        barcodeFormat === "ean13"
          ? 13
          : barcodeFormat === "ean8"
            ? 8
            : barcodeFormat === "upca"
              ? 12
              : 4096;
      setGtin(digitsOnly(v, max));
      return;
    }
    setGtin(v.slice(0, 4096));
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

  const hint = formatValidationHint(barcodeFormat);
  const def = getBarcodeFormatDef(barcodeFormat);
  const showGenerate = barcodeFormat === "ean13";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label
          htmlFor="barcode_format"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Barcode type
        </label>
        <select
          id="barcode_format"
          name="barcode_format"
          value={barcodeFormat}
          onChange={(e) => {
            setBarcodeFormat(e.target.value);
            setGtin("");
          }}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
        >
          {BARCODE_FORMAT_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.ids.map((id) => {
                const d = getBarcodeFormatDef(id);
                if (!d) return null;
                return (
                  <option key={id} value={id}>
                    {d.label}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
        {def ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {def.family === "2d"
              ? "2D — scan with a camera-based scanner."
              : "1D — works with many laser scanners."}{" "}
            {hint ? `· ${hint}` : null}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="gtin"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Barcode data
          </label>
          {barcodeFormat === "qrcode" ||
          barcodeFormat === "gs1qrcode" ||
          barcodeFormat === "swissqrcode" ||
          barcodeFormat === "datamatrix" ||
          barcodeFormat === "gs1datamatrix" ? (
            <textarea
              id="gtin"
              name="gtin"
              required
              rows={3}
              value={gtin}
              onChange={(e) => onPayloadChange(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground"
              placeholder={
                barcodeFormat === "swissqrcode"
                  ? "Swiss QR invoice payload…"
                  : "Text or structured payload…"
              }
            />
          ) : (
            <input
              id="gtin"
              name="gtin"
              type="text"
              autoComplete="off"
              required
              value={gtin}
              onChange={(e) => onPayloadChange(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground"
              placeholder={def?.label ?? "Payload"}
            />
          )}
        </div>
        {showGenerate ? (
          <button
            type="button"
            onClick={handleGenerateGtin}
            disabled={pending}
            className="shrink-0 rounded-md border border-border bg-muted px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 disabled:opacity-50"
          >
            Generate EAN-13
          </button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Values are validated per symbology. Retail GTINs normally use a GS1
        prefix; generated EAN-13s are for internal use.
      </p>
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Product name
        </label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          required
        />
      </div>
      <div>
        <label
          htmlFor="lot"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Lot (optional)
        </label>
        <input
          id="lot"
          name="lot"
          value={lot}
          onChange={(e) => setLot(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
        />
      </div>
      <div>
        <label
          htmlFor="price"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Price (USD)
        </label>
        <input
          id="price"
          name="price"
          inputMode="decimal"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
        />
      </div>
      <div>
        <label
          htmlFor="logo_url"
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Logo URL (optional)
        </label>
        <input
          id="logo_url"
          name="logo_url"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
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
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {selected ? "Save changes" : "Add SKU"}
        </button>
        {selected ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-md border border-red-300/80 bg-background px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
