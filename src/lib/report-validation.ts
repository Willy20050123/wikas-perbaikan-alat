export const VALID_KATEGORI = [
  "FASILITAS_INVENTARIS",
  "IT_ELEKTRONIK",
  "LABORATORIUM",
] as const;

export const VALID_SEVERITY = ["RINGAN", "SEDANG", "BERAT"] as const;

export const VALID_REPORT_STATUS = [
  "MENUNGGU",
  "DISETUJUI",
  "DITOLAK",
  "DIPROSES",
  "SELESAI",
] as const;

export type ValidKategori = (typeof VALID_KATEGORI)[number];
export type ValidSeverity = (typeof VALID_SEVERITY)[number];
export type ValidReportStatus = (typeof VALID_REPORT_STATUS)[number];

export type ReportInput = {
  kategori: string;
  namaBarang: string;
  lokasi: string;
  deskripsi: string;
  severity: string;
};

function trimmedValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseReportFormData(formData: FormData): ReportInput {
  return {
    kategori: trimmedValue(formData.get("kategori")),
    namaBarang: trimmedValue(formData.get("namaBarang")),
    lokasi: trimmedValue(formData.get("lokasi")),
    deskripsi: trimmedValue(formData.get("deskripsi")),
    severity: trimmedValue(formData.get("severity")),
  };
}

export function validateReportInput(input: ReportInput) {
  if (
    !input.kategori ||
    !input.namaBarang ||
    !input.lokasi ||
    !input.deskripsi ||
    !input.severity
  ) {
    return "Semua field wajib diisi.";
  }

  if (!VALID_KATEGORI.includes(input.kategori as ValidKategori)) {
    return "Kategori tidak valid.";
  }

  if (!VALID_SEVERITY.includes(input.severity as ValidSeverity)) {
    return "Tingkat kerusakan tidak valid.";
  }

  if (input.namaBarang.length > 120) {
    return "Nama barang maksimal 120 karakter.";
  }

  if (input.lokasi.length > 120) {
    return "Lokasi maksimal 120 karakter.";
  }

  if (input.deskripsi.length > 2000) {
    return "Deskripsi maksimal 2000 karakter.";
  }

  return null;
}
