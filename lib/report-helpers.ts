export type ReportKategori =
  | "FASILITAS_INVENTARIS"
  | "IT_ELEKTRONIK"
  | "LABORATORIUM";

export type ReportStatus =
  | "MENUNGGU"
  | "DISETUJUI"
  | "DITOLAK"
  | "DIPROSES"
  | "SELESAI";

export type ReportSeverity = "RINGAN" | "SEDANG" | "BERAT";

export function formatKategori(kategori: ReportKategori) {
  if (kategori === "FASILITAS_INVENTARIS") return "Fasilitas & Inventaris";
  if (kategori === "IT_ELEKTRONIK") return "IT & Elektronik";
  return "Laboratorium";
}

export function formatStatus(status: ReportStatus) {
  if (status === "MENUNGGU") return "Menunggu";
  if (status === "DISETUJUI") return "Disetujui";
  if (status === "DITOLAK") return "Ditolak";
  if (status === "DIPROSES") return "Diproses";
  return "Selesai";
}

export function formatSeverity(severity: ReportSeverity) {
  if (severity === "RINGAN") return "Ringan";
  if (severity === "SEDANG") return "Sedang";
  return "Berat";
}

export function getStatusClass(status: ReportStatus) {
  if (status === "MENUNGGU") {
    return "border border-cyan-300/25 bg-cyan-400/14 text-cyan-50";
  }
  if (status === "DISETUJUI") {
    return "border border-emerald-300/25 bg-emerald-400/14 text-emerald-50";
  }
  if (status === "DITOLAK") {
    return "border border-rose-300/25 bg-rose-400/14 text-rose-50";
  }
  if (status === "DIPROSES") {
    return "border border-amber-300/25 bg-amber-400/14 text-amber-50";
  }
  return "border border-emerald-300/25 bg-emerald-400/14 text-emerald-50";
}

export function formatTanggal(value: string | Date | null) {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}