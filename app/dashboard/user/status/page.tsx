"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusList from "@/src/components/dashboard/StatusList";
import type { StatusReportItem } from "@/src/components/dashboard/StatusCard";

export default function UserStatusPage() {
  const router = useRouter();
  const [reports, setReports] = useState<StatusReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingReportId, setDeletingReportId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<
    "SEMUA" | "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "DIPROSES" | "SELESAI"
  >("SEMUA");

  async function loadReports() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/reports", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gagal memuat status laporan.");
        return;
      }

      setReports(data.reports || []);
    } catch (error) {
      console.error("LOAD_USER_STATUS_ERROR:", error);
      setMessage("Terjadi kesalahan saat memuat status laporan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  async function handleDeleteReport(reportId: number) {
    const confirmed = window.confirm(
      "Hapus laporan ini? Aksi ini hanya tersedia untuk laporan yang masih menunggu."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingReportId(reportId);
      setMessage("");

      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gagal menghapus laporan.");
        return;
      }

      setMessage(data.message || "Laporan berhasil dihapus.");
      await loadReports();
    } catch (error) {
      console.error("DELETE_REPORT_ERROR:", error);
      setMessage("Terjadi kesalahan saat menghapus laporan.");
    } finally {
      setDeletingReportId(null);
    }
  }

  const filteredReports = useMemo(() => {
    if (filter === "SEMUA") return reports;
    return reports.filter((item) => item.status === filter);
  }, [filter, reports]);

  const totalReports = reports.length;
  const waitingReports = reports.filter((r) => r.status === "MENUNGGU").length;
  const approvedReports = reports.filter((r) => r.status === "DISETUJUI").length;
  const rejectedReports = reports.filter((r) => r.status === "DITOLAK").length;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
              Dashboard Pegawai
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">Cek Status Laporan</h1>
            <p className="mt-3 max-w-2xl text-white/70">
              Lihat apakah laporan kamu masih menunggu, sudah disetujui,
              ditolak, sedang diproses, atau sudah selesai.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard/user")}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
            >
              Kembali
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/user/report")}
              className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-white transition hover:bg-cyan-400"
            >
              Buat Laporan Baru
            </button>
          </div>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Total Laporan
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{totalReports}</p>
            <p className="mt-3 text-sm text-white/60">Semua laporan milik kamu.</p>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Menunggu
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{waitingReports}</p>
            <p className="mt-3 text-sm text-white/60">Menunggu keputusan admin.</p>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Disetujui
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{approvedReports}</p>
            <p className="mt-3 text-sm text-white/60">Sudah diterima admin.</p>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Ditolak
            </p>
            <p className="mt-3 text-5xl font-extrabold text-white">{rejectedReports}</p>
            <p className="mt-3 text-sm text-white/60">Perlu cek alasan penolakan.</p>
          </div>
        </section>

        <section className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.08] p-4">
          <div className="flex flex-wrap gap-3">
            {[
              "SEMUA",
              "MENUNGGU",
              "DISETUJUI",
              "DITOLAK",
              "DIPROSES",
              "SELESAI",
            ].map((item) => {
              const active = filter === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(
                      item as
                        | "SEMUA"
                        | "MENUNGGU"
                        | "DISETUJUI"
                        | "DITOLAK"
                        | "DIPROSES"
                        | "SELESAI"
                    )
                  }
                  className={[
                    "rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                    active
                      ? "border-cyan-300/25 bg-cyan-400/15 text-cyan-50"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                  ].join(" ")}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        {message ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-10 text-center text-white/70">
            Memuat status laporan...
          </div>
        ) : (
          <StatusList
            reports={filteredReports}
            deletingReportId={deletingReportId}
            onEdit={(reportId) => router.push(`/dashboard/user/report/${reportId}`)}
            onDelete={(reportId) => void handleDeleteReport(reportId)}
          />
        )}
      </div>
    </div>
  );
}
