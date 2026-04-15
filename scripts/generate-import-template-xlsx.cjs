/**
 * Regenerates public/sku-import-template.xlsx to match public/sku-import-template.csv.
 * Run: node scripts/generate-import-template-xlsx.cjs
 */
const XLSX = require("xlsx");
const { writeFileSync } = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "public", "sku-import-template.xlsx");

const wb = XLSX.utils.book_new();
const data = [
  ["gtin", "name", "lot", "price", "logo_url"],
  ["5901234123457", "Example Organic Oat Milk 1L", "LOT-2024-A", 4.99, ""],
];
const ws = XLSX.utils.aoa_to_sheet(data);
ws["!cols"] = [
  { wch: 16 },
  { wch: 36 },
  { wch: 14 },
  { wch: 10 },
  { wch: 36 },
];
XLSX.utils.book_append_sheet(wb, ws, "SKUs");
writeFileSync(out, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log("Wrote", out);
