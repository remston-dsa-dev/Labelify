"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateEan13, resolveEan13FromInput } from "@/lib/gtin";

function gtinFormError(reason: "empty" | "bad_length" | "bad_check"): string {
  if (reason === "empty") return "Enter a GTIN.";
  if (reason === "bad_length") {
    return "Enter 12 or 13 digits (EAN-13).";
  }
  return "Invalid EAN-13 check digit; use 12 digits to auto-fill the check digit.";
}

function formatMoneyError(cents: number) {
  if (!Number.isInteger(cents) || cents < 0) {
    return "Price must be a non-negative integer (cents).";
  }
  return null;
}

export async function createSku(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const gtinRaw = String(formData.get("gtin") ?? "");
  const resolved = resolveEan13FromInput(gtinRaw);
  if (!resolved.ok) {
    return { error: gtinFormError(resolved.reason) };
  }
  const normalized = resolved.gtin;

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
      return { error: "This GTIN already exists for your account." };
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

  const gtinRaw = String(formData.get("gtin") ?? "");
  const resolved = resolveEan13FromInput(gtinRaw);
  if (!resolved.ok) {
    return { error: gtinFormError(resolved.reason) };
  }
  const normalized = resolved.gtin;

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
      return { error: "This GTIN already exists for your account." };
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
      .maybeSingle();

    if (!data) {
      return { gtin: candidate, error: null as null };
    }
  }

  return { error: "Could not generate a unique GTIN. Try again." as const, gtin: null };
}
