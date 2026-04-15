export type SkuRow = {
  id: string;
  user_id: string;
  gtin: string;
  name: string;
  lot: string | null;
  price_cents: number;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};
