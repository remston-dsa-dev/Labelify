import { Dashboard } from "@/components/dashboard";
import { createClient } from "@/lib/supabase/server";
import type { SkuImportRow, SkuRow } from "@/lib/types/sku";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: skus, error } = await supabase
    .from("skus")
    .select("*")
    .order("created_at", { ascending: false });

  const importsResult = await supabase
    .from("sku_imports")
    .select("*")
    .order("created_at", { ascending: false });
  const imports = importsResult.error ? [] : (importsResult.data ?? []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-center text-sm text-red-600 dark:text-red-400">
          Could not load SKUs: {error.message}. Check Supabase env and migrations.
        </p>
      </div>
    );
  }

  return (
    <Dashboard
      initialSkus={(skus ?? []) as SkuRow[]}
      initialImports={(imports ?? []) as SkuImportRow[]}
    />
  );
}
