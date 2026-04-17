"use client";

import StatusBadge from "./StatusBadge";
import {
  formatKategori,
  formatSeverity,
  formatTanggal,
  type ReportKategori,
  type ReportSeverity,
  type ReportStatus,
} from "@/lib/report-helpers";

export type StatusReportItem = {
  id: number;
  kategori: ReportKategori;
  namaBarang: string;
  lokasi: string;
  deskripsi: string;
  severity: ReportSeverity;
  fotoUrl: string | null;
  status: ReportStatus;
  alasanPenolakan: string | null;
  createdAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
};

type StatusCardProps = {
  report: StatusReportItem;
};

export default function StatusCard({ report }: StatusCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.08] shadow-[0_20px_50px_rgba(2,6,23,0.18)] backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="border-b border-white/10 bg-slate-950/30 p-4 lg:border-b-0 lg:border-r">
          {report.fotoUrl ? (
            <img
              src={report.fotoUrl}
              alt={report.namaBarang}
              className="h-full max-h-[320px] w-full rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-white/50">
              Tidak ada foto
            </div>
          )}
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
                Laporan #{String(report.id).padStart(4, "0")}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {report.namaBarang}
              </h3>
              <p className="mt-2 text-sm text-white/65">
                Dikirim pada {formatTanggal(report.createdAt)}
              </p>
            </div>

            <div className="shrink-0">
              <StatusBadge status={report.status} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Kategori</p>
              <p className="mt-1 font-semibold text-white">
                {formatKategori(report.kategori)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Lokasi</p>
              <p className="mt-1 font-semibold text-white">{report.lokasi}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Tingkat Kerusakan</p>
              <p className="mt-1 font-semibold text-white">
                {formatSeverity(report.severity)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Update Status</p>
              <p className="mt-1 font-semibold text-white">
                {report.status === "DISETUJUI"
                  ? `Disetujui pada ${formatTanggal(report.approvedAt || null)}`
                  : report.status === "DITOLAK"
                  ? `Ditolak pada ${formatTanggal(report.rejectedAt || null)}`
                  : "Menunggu keputusan admin"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/55">Deskripsi Kerusakan</p>
            <p className="mt-2 whitespace-pre-line leading-7 text-white/85">
              {report.deskripsi}
            </p>
          </div>

          {report.status === "DITOLAK" && report.alasanPenolakan ? (
            <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4">
              <p className="text-sm font-semibold text-rose-100">
                Alasan Penolakan
              </p>
              <p className="mt-2 whitespace-pre-line leading-7 text-rose-50/90">
                {report.alasanPenolakan}
              </p>
            </div>
          ) : null}

          {report.status === "DISETUJUI" ? (
            <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-100">
                Laporan Disetujui
              </p>
              <p className="mt-2 leading-7 text-emerald-50/90">
                Laporan kamu sudah diterima admin dan masuk proses tindak lanjut.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}