export type SkuRow = {
  id: string;
  user_id: string;
  /** Symbology id (see `lib/barcode-formats.ts`). Missing before migration → treat as `ean13`. */
  barcode_format?: string;
  gtin: string;
  name: string;
  lot: string | null;
  price_cents: number;
  logo_url: string | null;
  import_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SkuImportRow = {
  id: string;
  user_id: string;
  filename: string;
  row_count: number;
  status: "completed" | "partial" | "failed";
  error_summary: string | null;
  created_at: string;
};
