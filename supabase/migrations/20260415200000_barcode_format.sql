-- SKU symbology: store barcode type + payload (column still named gtin for compatibility)

alter table public.skus drop constraint if exists skus_gtin_check;

alter table public.skus
  add column if not exists barcode_format text not null default 'ean13';

alter table public.skus
  drop constraint if exists skus_user_id_gtin_key;

alter table public.skus
  drop constraint if exists skus_gtin_payload_len;

alter table public.skus
  add constraint skus_gtin_payload_len check (char_length(gtin) >= 1 and char_length(gtin) <= 4096);

alter table public.skus
  drop constraint if exists skus_user_gtin_format_unique;

alter table public.skus
  add constraint skus_user_gtin_format_unique unique (user_id, gtin, barcode_format);

create index if not exists skus_user_format_idx
  on public.skus (user_id, barcode_format);
