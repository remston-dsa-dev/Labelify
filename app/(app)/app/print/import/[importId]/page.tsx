import { BatchPrintView } from "@/components/batch-print-view";
import { createClient } from "@/lib/supabase/server";
import type { SkuRow } from "@/lib/types/sku";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ImportPrintPage({
  params,
}: {
  params: Promise<{ importId: string }>;
}) {
  const { importId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <p className="p-6 text-sm">
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    );
  }

  const { data: imp } = await supabase
    .from("sku_imports")
    .select("filename")
    .eq("id", importId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!imp) notFound();

  const { data: skus, error } = await supabase
    .from("skus")
    .select("*")
    .eq("import_id", importId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error || !skus?.length) {
    notFound();
  }

  return (
    <BatchPrintView
      skus={skus as SkuRow[]}
      importFilename={imp.filename}
    />
  );
}
