"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import {
  formatKategori,
  formatTanggal,
  formatSeverity,
  formatStatus,
  getStatusClass,
  type ReportKategori,
  type ReportSeverity,
  type ReportStatus,
} from "@/lib/report-helpers";

type ReportItem = {
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
  user: {
    id: number;
    nama: string;
    email: string;
  };
};

export default function AdminHistoryPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/reports/admin", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gagal memuat riwayat laporan.");
        return;
      }

      const filtered = (data.reports || []).filter(
        (item: ReportItem) =>
          item.status === "DISETUJUI" ||
          item.status === "DITOLAK" ||
          item.status === "DIPROSES" ||
          item.status === "SELESAI"
      );

      setReports(filtered);
    } catch (error) {
      console.error("LOAD_ADMIN_HISTORY_ERROR:", error);
      setMessage("Terjadi kesalahan saat memuat riwayat laporan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  const approvedCount = reports.filter((r) => r.status === "DISETUJUI").length;
  const rejectedCount = reports.filter((r) => r.status === "DITOLAK").length;
  const processCount = reports.filter((r) => r.status === "DIPROSES").length;
  const finishedCount = reports.filter((r) => r.status === "SELESAI").length;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
              Admin Panel
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">
              Riwayat Laporan
            </h1>
            <p className="mt-3 max-w-2xl text-white/70">
              Arsip laporan yang sudah diputuskan admin, sedang diproses, atau
              sudah selesai.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/admin")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </button>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Disetujui
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{approvedCount}</p>
            <p className="mt-3 text-sm text-white/60">Laporan diterima admin.</p>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Ditolak
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{rejectedCount}</p>
            <p className="mt-3 text-sm text-white/60">Laporan yang ditolak admin.</p>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Diproses
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{processCount}</p>
            <p className="mt-3 text-sm text-white/60">Sedang ditindaklanjuti.</p>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Selesai
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{finishedCount}</p>
            <p className="mt-3 text-sm text-white/60">Pengerjaan sudah selesai.</p>
          </div>
        </section>

        {message ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
            {message}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] shadow-[0_24px_60px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-bold text-white">Arsip Laporan</h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-white/70">Memuat riwayat laporan...</div>
          ) : reports.length === 0 ? (
            <div className="px-6 py-8 text-white/70">Belum ada riwayat laporan.</div>
          ) : (
            <div className="space-y-4 p-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-sm font-bold tracking-wide text-cyan-50">
                          LP-{String(report.id).padStart(4, "0")}
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] ${getStatusClass(
                            report.status
                          )}`}
                        >
                          {formatStatus(report.status)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-bold text-white">
                        {report.namaBarang}
                      </h3>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm text-white/55">Pelapor</p>
                          <p className="mt-1 font-semibold text-white">
                            {report.user.nama}
                          </p>
                          <p className="mt-1 text-sm text-white/55">
                            {report.user.email}
                          </p>
                        </div>

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
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/55">Deskripsi Kerusakan</p>
                        <p className="mt-2 whitespace-pre-line leading-7 text-white/85">
                          {report.deskripsi}
                        </p>
                      </div>

                      {report.status === "DITOLAK" && report.alasanPenolakan ? (
                        <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4">
                          <p className="text-sm font-semibold text-rose-100">
                            Alasan Penolakan
                          </p>
                          <p className="mt-2 text-rose-50/90">
                            {report.alasanPenolakan}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="w-full lg:max-w-[320px]">
                      <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
                        <p className="mb-3 text-sm text-white/55">Foto Barang</p>

                        {report.fotoUrl ? (
                          <img
                            src={report.fotoUrl}
                            alt={report.namaBarang}
                            className="w-full rounded-2xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-white/50">
                            Tidak ada foto
                          </div>
                        )}

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <CalendarDays className="h-4 w-4 text-white/60" />
                            <div>
                              <p className="text-xs text-white/50">Tanggal Laporan</p>
                              <p className="text-sm font-semibold text-white">
                                {formatTanggal(report.createdAt)}
                              </p>
                            </div>
                          </div>

                          {report.status === "DISETUJUI" ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-100" />
                              <div>
                                <p className="text-xs text-emerald-100/70">Disetujui</p>
                                <p className="text-sm font-semibold text-emerald-50">
                                  {formatTanggal(report.approvedAt || null)}
                                </p>
                              </div>
                            </div>
                          ) : null}

                          {report.status === "DITOLAK" ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3">
                              <XCircle className="h-4 w-4 text-rose-100" />
                              <div>
                                <p className="text-xs text-rose-100/70">Ditolak</p>
                                <p className="text-sm font-semibold text-rose-50">
                                  {formatTanggal(report.rejectedAt || null)}
                                </p>
                              </div>
                            </div>
                          ) : null}

                          {report.status === "DIPROSES" ? (
                            <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3">
                              <Clock3 className="h-4 w-4 text-amber-100" />
                              <div>
                                <p className="text-xs text-amber-100/70">Diproses</p>
                                <p className="text-sm font-semibold text-amber-50">
                                  Sedang ditindaklanjuti
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}