"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_BARCODE_FORMAT_ID,
  isSupportedBarcodeFormatId,
} from "@/lib/barcode-formats";
import { validateBarcodePayload } from "@/lib/barcode-validate";
import { generateEan13 } from "@/lib/gtin";

function formatMoneyError(cents: number) {
  if (!Number.isInteger(cents) || cents < 0) {
    return "Price must be a non-negative integer (cents).";
  }
  return null;
}

function readFormat(formData: FormData): string | { error: string } {
  const raw = String(formData.get("barcode_format") ?? "").trim();
  const id = raw || DEFAULT_BARCODE_FORMAT_ID;
  if (!isSupportedBarcodeFormatId(id)) {
    return { error: "Invalid barcode type." };
  }
  return id;
}

export async function createSku(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const formatRead = readFormat(formData);
  if (typeof formatRead === "object") return formatRead;

  const payloadRaw = String(formData.get("gtin") ?? "");
  const validated = validateBarcodePayload(formatRead, payloadRaw);
  if (!validated.ok) {
    return { error: validated.error };
  }
  const normalized = validated.value;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Product name is required." };

  const lot = String(formData.get("lot") ?? "").trim() || null;
  const priceCents = Number(formData.get("price_cents") ?? 0);
  const err = formatMoneyError(priceCents);
  if (err) return { error: err };

  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;

  const { data, error } = await supabase
    .from("skus")
    .insert({
      user_id: user.id,
      barcode_format: formatRead,
      gtin: normalized,
      name,
      lot,
      price_cents: priceCents,
      logo_url: logoUrl,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "This barcode value already exists for your account (same type)." };
    }
    return { error: error.message };
  }

  if (!data?.id) {
    return { error: "Failed to create SKU." };
  }

  revalidatePath("/app");
  return { ok: true as const, id: data.id };
}

export async function updateSku(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const formatRead = readFormat(formData);
  if (typeof formatRead === "object") return formatRead;

  const payloadRaw = String(formData.get("gtin") ?? "");
  const validated = validateBarcodePayload(formatRead, payloadRaw);
  if (!validated.ok) {
    return { error: validated.error };
  }
  const normalized = validated.value;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Product name is required." };

  const lot = String(formData.get("lot") ?? "").trim() || null;
  const priceCents = Number(formData.get("price_cents") ?? 0);
  const err = formatMoneyError(priceCents);
  if (err) return { error: err };

  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;

  const { error } = await supabase
    .from("skus")
    .update({
      barcode_format: formatRead,
      gtin: normalized,
      name,
      lot,
      price_cents: priceCents,
      logo_url: logoUrl,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "This barcode value already exists for your account (same type)." };
    }
    return { error: error.message };
  }

  revalidatePath("/app");
  return { ok: true as const };
}

export async function deleteSku(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("skus")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app");
  return { ok: true as const };
}

/** Only for EAN-13 auto-value in the form. */
export async function generateNextGtin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." as const, gtin: null };

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = generateEan13();
    const { data } = await supabase
      .from("skus")
      .select("id")
      .eq("user_id", user.id)
      .eq("gtin", candidate)
      .eq("barcode_format", "ean13")
      .maybeSingle();

    if (!data) {
      return { gtin: candidate, error: null as null };
    }
  }

  return { error: "Could not generate a unique GTIN. Try again." as const, gtin: null };
}
