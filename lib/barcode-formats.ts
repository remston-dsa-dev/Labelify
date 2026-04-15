/** Curated symbologies aligned with common industry use (see e.g. Scanbot’s overview). Mapped to bwip-js `bcid` values. */

export type BarcodeFamily = "1d" | "2d";

export type BarcodeFormatDef = {
  /** Stored in DB / forms; stable slug */
  id: string;
  /** bwip-js barcode id */
  bcid: string;
  family: BarcodeFamily;
  /** Short UI title */
  label: string;
};

export const DEFAULT_BARCODE_FORMAT_ID = "ean13";

export const BARCODE_FORMATS: BarcodeFormatDef[] = [
  // Retail / GS1
  { id: "ean13", bcid: "ean13", family: "1d", label: "EAN-13 (GTIN-13)" },
  { id: "ean8", bcid: "ean8", family: "1d", label: "EAN-8" },
  { id: "ean14", bcid: "ean14", family: "1d", label: "EAN-14 (GTIN-14)" },
  { id: "upca", bcid: "upca", family: "1d", label: "UPC-A (12 digits)" },
  { id: "upce", bcid: "upce", family: "1d", label: "UPC-E" },
  { id: "isbn", bcid: "isbn", family: "1d", label: "ISBN (Bookland EAN-13)" },
  { id: "ismn", bcid: "ismn", family: "1d", label: "ISMN" },
  { id: "issn", bcid: "issn", family: "1d", label: "ISSN" },
  { id: "itf14", bcid: "itf14", family: "1d", label: "ITF-14 / SSC" },
  { id: "sscc18", bcid: "sscc18", family: "1d", label: "SSCC-18" },
  { id: "gs1-128", bcid: "gs1-128", family: "1d", label: "GS1-128" },
  { id: "gs1-cc", bcid: "gs1-cc", family: "1d", label: "GS1 Composite 2D" },
  { id: "databaromni", bcid: "databaromni", family: "1d", label: "GS1 DataBar Omnidirectional" },
  { id: "databartruncated", bcid: "databartruncated", family: "1d", label: "GS1 DataBar Truncated" },
  { id: "databarstacked", bcid: "databarstacked", family: "1d", label: "GS1 DataBar Stacked" },
  { id: "databarstackedomni", bcid: "databarstackedomni", family: "1d", label: "GS1 DataBar Stacked Omnidirectional" },
  { id: "databarlimited", bcid: "databarlimited", family: "1d", label: "GS1 DataBar Limited" },
  { id: "databarexpanded", bcid: "databarexpanded", family: "1d", label: "GS1 DataBar Expanded" },
  { id: "databarexpandedstacked", bcid: "databarexpandedstacked", family: "1d", label: "GS1 DataBar Expanded Stacked" },
  { id: "ean2", bcid: "ean2", family: "1d", label: "EAN-2 add-on" },
  { id: "ean5", bcid: "ean5", family: "1d", label: "EAN-5 add-on" },

  // Linear — general & industrial (article: Code 39, 93, 128, 11, Codabar, ITF, etc.)
  { id: "code39", bcid: "code39", family: "1d", label: "Code 39 (incl. VIN-style payloads)" },
  { id: "code39ext", bcid: "code39ext", family: "1d", label: "Code 39 Extended" },
  { id: "pzn", bcid: "pzn", family: "1d", label: "PZN (Pharmazentralnummer)" },
  { id: "code32", bcid: "code32", family: "1d", label: "Code 32 (Italian pharma)" },
  { id: "code93", bcid: "code93", family: "1d", label: "Code 93" },
  { id: "code93ext", bcid: "code93ext", family: "1d", label: "Code 93 Extended" },
  { id: "code128", bcid: "code128", family: "1d", label: "Code 128" },
  { id: "code11", bcid: "code11", family: "1d", label: "Code 11" },
  { id: "codabar", bcid: "rationalizedCodabar", family: "1d", label: "Codabar" },
  { id: "interleaved2of5", bcid: "interleaved2of5", family: "1d", label: "Interleaved 2 of 5 (ITF)" },
  { id: "industrial2of5", bcid: "industrial2of5", family: "1d", label: "Industrial 2 of 5" },
  { id: "iata2of5", bcid: "iata2of5", family: "1d", label: "Standard 2 of 5 / IATA" },
  { id: "matrix2of5", bcid: "matrix2of5", family: "1d", label: "Matrix 2 of 5" },
  { id: "datalogic2of5", bcid: "datalogic2of5", family: "1d", label: "Datalogic 2 of 5" },
  { id: "coop2of5", bcid: "coop2of5", family: "1d", label: "COOP 2 of 5" },
  { id: "code2of5", bcid: "code2of5", family: "1d", label: "Code 25 / non-interleaved 2 of 5" },
  { id: "msi", bcid: "msi", family: "1d", label: "MSI Plessey" },
  { id: "plessey", bcid: "plessey", family: "1d", label: "Plessey (UK)" },
  { id: "telepen", bcid: "telepen", family: "1d", label: "Telepen" },
  { id: "telepennumeric", bcid: "telepennumeric", family: "1d", label: "Telepen Numeric" },
  { id: "pharmacode", bcid: "pharmacode", family: "1d", label: "Pharmacode (one-track)" },
  { id: "pharmacode2", bcid: "pharmacode2", family: "1d", label: "Pharmacode (two-track)" },
  { id: "code16k", bcid: "code16k", family: "2d", label: "Code 16K" },
  { id: "code49", bcid: "code49", family: "2d", label: "Code 49" },
  { id: "codeone", bcid: "codeone", family: "2d", label: "Code One" },

  // Postal / 4-state (article: IMb, RM4SCC, KIX, AusPost, Japan Post, etc.)
  { id: "onecode", bcid: "onecode", family: "1d", label: "USPS Intelligent Mail (IMb)" },
  { id: "postnet", bcid: "postnet", family: "1d", label: "USPS POSTNET" },
  { id: "planet", bcid: "planet", family: "1d", label: "USPS PLANET" },
  { id: "royalmail", bcid: "royalmail", family: "1d", label: "Royal Mail RM4SCC" },
  { id: "kix", bcid: "kix", family: "1d", label: "KIX (Netherlands Post)" },
  { id: "auspost", bcid: "auspost", family: "1d", label: "Australia Post 4-state" },
  { id: "japanpost", bcid: "japanpost", family: "1d", label: "Japan Post 4-state" },
  { id: "mailmark", bcid: "mailmark", family: "2d", label: "Royal Mail Mailmark (2D)" },
  { id: "identcode", bcid: "identcode", family: "1d", label: "Deutsche Post Identcode" },
  { id: "leitcode", bcid: "leitcode", family: "1d", label: "Deutsche Post Leitcode" },

  // Stacked / PDF
  { id: "pdf417", bcid: "pdf417", family: "2d", label: "PDF417" },
  { id: "pdf417compact", bcid: "pdf417compact", family: "2d", label: "Compact PDF417" },
  { id: "micropdf417", bcid: "micropdf417", family: "2d", label: "MicroPDF417" },

  // Matrix / 2D (article: Data Matrix, QR, Aztec, MaxiCode, Han Xin, DotCode…)
  { id: "datamatrix", bcid: "datamatrix", family: "2d", label: "Data Matrix" },
  { id: "datamatrixrectangular", bcid: "datamatrixrectangular", family: "2d", label: "Data Matrix Rectangular" },
  { id: "gs1datamatrix", bcid: "gs1datamatrix", family: "2d", label: "GS1 Data Matrix (incl. NTIN/PPN-style)" },
  { id: "gs1datamatrixrectangular", bcid: "gs1datamatrixrectangular", family: "2d", label: "GS1 Data Matrix Rectangular" },
  { id: "gs1dotcode", bcid: "gs1dotcode", family: "2d", label: "GS1 DotCode" },
  { id: "dotcode", bcid: "dotcode", family: "2d", label: "DotCode" },
  { id: "qrcode", bcid: "qrcode", family: "2d", label: "QR Code (incl. GiroCode-style payloads)" },
  { id: "gs1qrcode", bcid: "gs1qrcode", family: "2d", label: "GS1 QR Code" },
  { id: "gs1dlqrcode", bcid: "gs1dlqrcode", family: "2d", label: "GS1 Digital Link QR" },
  { id: "swissqrcode", bcid: "swissqrcode", family: "2d", label: "Swiss QR Code" },
  { id: "microqrcode", bcid: "microqrcode", family: "2d", label: "Micro QR Code" },
  { id: "rectangularmicroqrcode", bcid: "rectangularmicroqrcode", family: "2d", label: "Rectangular Micro QR (rMQR)" },
  { id: "azteccode", bcid: "azteccode", family: "2d", label: "Aztec Code" },
  { id: "azteccodecompact", bcid: "azteccodecompact", family: "2d", label: "Compact Aztec" },
  { id: "hanxin", bcid: "hanxin", family: "2d", label: "Han Xin Code" },
  { id: "maxicode", bcid: "maxicode", family: "2d", label: "MaxiCode (UPS)" },
  { id: "ultracode", bcid: "ultracode", family: "2d", label: "Ultracode" },

  // Misc
  { id: "flattermarken", bcid: "flattermarken", family: "1d", label: "Flattermarken" },
  { id: "channelcode", bcid: "channelcode", family: "1d", label: "Channel Code" },
  { id: "raw", bcid: "raw", family: "1d", label: "Custom 1D (raw)" },
];

const FORMAT_BY_ID = new Map(BARCODE_FORMATS.map((f) => [f.id, f]));

export function getBarcodeFormatDef(id: string): BarcodeFormatDef | undefined {
  return FORMAT_BY_ID.get(id);
}

export function isSupportedBarcodeFormatId(id: string): boolean {
  return FORMAT_BY_ID.has(id);
}

/** Group labels for <optgroup> in the SKU form */
export const BARCODE_FORMAT_GROUPS: { label: string; ids: string[] }[] = [
  {
    label: "Retail & GS1",
    ids: [
      "ean13",
      "ean8",
      "ean14",
      "upca",
      "upce",
      "isbn",
      "ismn",
      "issn",
      "itf14",
      "sscc18",
      "gs1-128",
      "gs1-cc",
      "databaromni",
      "databartruncated",
      "databarstacked",
      "databarstackedomni",
      "databarlimited",
      "databarexpanded",
      "databarexpandedstacked",
      "ean2",
      "ean5",
    ],
  },
  {
    label: "Linear 1D",
    ids: [
      "code39",
      "code39ext",
      "pzn",
      "code32",
      "code93",
      "code93ext",
      "code128",
      "code11",
      "codabar",
      "interleaved2of5",
      "industrial2of5",
      "iata2of5",
      "matrix2of5",
      "datalogic2of5",
      "coop2of5",
      "code2of5",
      "msi",
      "plessey",
      "telepen",
      "telepennumeric",
      "pharmacode",
      "pharmacode2",
      "onecode",
      "postnet",
      "planet",
      "royalmail",
      "kix",
      "auspost",
      "japanpost",
      "identcode",
      "leitcode",
      "flattermarken",
      "channelcode",
      "raw",
    ],
  },
  {
    label: "2D, stacked & postal",
    ids: [
      "code16k",
      "code49",
      "codeone",
      "mailmark",
      "pdf417",
      "pdf417compact",
      "micropdf417",
      "datamatrix",
      "datamatrixrectangular",
      "gs1datamatrix",
      "gs1datamatrixrectangular",
      "gs1dotcode",
      "dotcode",
      "qrcode",
      "gs1qrcode",
      "gs1dlqrcode",
      "swissqrcode",
      "microqrcode",
      "rectangularmicroqrcode",
      "azteccode",
      "azteccodecompact",
      "hanxin",
      "maxicode",
      "ultracode",
    ],
  },
];
