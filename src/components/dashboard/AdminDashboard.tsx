"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  History,
  House,
  LogOut,
  Wrench,
  X,
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

type AdminDashboardProps = {
  roleLabel: string;
  title?: string;
};

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

export default function AdminDashboard({
  roleLabel,
  title = "Dashboard Laporan Kerusakan Barang & Alat",
}: AdminDashboardProps) {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/reports/admin", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gagal memuat laporan.");
        return;
      }

      setReports(data.reports || []);
    } catch (error) {
      console.error("LOAD_ADMIN_REPORTS_ERROR:", error);
      setMessage("Terjadi kesalahan saat memuat laporan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
  }, []);

  async function handleApprove(id: number) {
    setSubmitLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/reports/${id}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "APPROVE",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gagal menyetujui laporan.");
        return;
      }

      setMessage("Laporan disetujui.");
      setSelectedReport(null);
      setAlasanPenolakan("");
      await loadReports();
    } catch (error) {
      console.error("APPROVE_REPORT_ERROR:", error);
      setMessage("Terjadi kesalahan saat menyetujui laporan.");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleReject(id: number) {
    setSubmitLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/reports/${id}/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "REJECT",
          alasanPenolakan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Gagal menolak laporan.");
        return;
      }

      setMessage("Laporan ditolak.");
      setSelectedReport(null);
      setAlasanPenolakan("");
      await loadReports();
    } catch (error) {
      console.error("REJECT_REPORT_ERROR:", error);
      setMessage("Terjadi kesalahan saat menolak laporan.");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (!res.ok) {
        setMessage("Logout gagal.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT_ERROR:", error);
      setMessage("Terjadi kesalahan saat logout.");
    }
  }

  const totalReports = reports.length;
  const waitingReports = reports.filter((r) => r.status === "MENUNGGU").length;
  const approvedReports = reports.filter((r) => r.status === "DISETUJUI").length;
  const rejectedReports = reports.filter((r) => r.status === "DITOLAK").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b2038] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.46]"
        style={{
          backgroundImage: "url('/images/dashboard-bg.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_26%),radial-gradient(circle_at_bottom_center,rgba(52,211,153,0.10),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,23,43,0.68)_0%,rgba(8,23,43,0.50)_28%,rgba(8,23,43,0.22)_58%,rgba(8,23,43,0.56)_100%)]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[286px] flex-col justify-between border-r border-white/10 bg-slate-900/16 px-5 py-6 backdrop-blur-2xl lg:flex">
          <div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.18)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/22 bg-gradient-to-br from-cyan-300/16 to-blue-500/16 text-cyan-100">
                <Wrench className="h-7 w-7" />
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
                Internal System
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-white">
                Admin Panel
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Admin menerima laporan user, melihat foto barang, lalu
                menyetujui atau menolak perbaikan.
              </p>
            </div>

            <div className="mt-7 px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                Navigation
              </p>
            </div>

            <nav className="mt-3 space-y-3">
              <button
                onClick={() => router.push("/dashboard/admin")}
                className="flex w-full items-center gap-3 rounded-2xl border border-cyan-300/24 bg-gradient-to-r from-cyan-400/18 to-blue-500/16 px-4 py-3.5 text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/22 bg-cyan-300/12 text-cyan-100">
                  <House className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-white">
                    Beranda
                  </span>
                  <span className="block text-xs text-white/55">
                    Ringkasan dashboard
                  </span>
                </span>
              </button>

              <button
                onClick={() => router.push("/dashboard/admin")}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-left hover:bg-white/[0.11]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/90">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-white">
                    Laporan Masuk
                  </span>
                  <span className="block text-xs text-white/55">
                    Daftar laporan pegawai
                  </span>
                </span>
              </button>

              <button
                onClick={() => router.push("/dashboard/admin/history")}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-left hover:bg-white/[0.11]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/90">
                  <History className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-white">
                    Riwayat
                  </span>
                  <span className="block text-xs text-white/55">
                    Arsip laporan sebelumnya
                  </span>
                </span>
              </button>

              <button
                onClick={() => router.push("/dashboard/admin/statistik")}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-left hover:bg-white/[0.11]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/90">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-white">
                    Statistik
                  </span>
                  <span className="block text-xs text-white/55">
                    Rekap laporan bulanan
                  </span>
                </span>
              </button>
            </nav>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl border border-rose-300/15 bg-rose-400/10 px-4 py-4 text-left transition hover:bg-rose-400/15"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-300/18 bg-rose-300/10">
                  <LogOut className="h-5 w-5 text-rose-100" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-white">
                    Logout
                  </span>
                  <span className="block text-xs text-white/55">
                    Keluar dari dashboard admin
                  </span>
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-white/60" />
            </button>

            <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.14] to-white/[0.07] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.18)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-300/22 bg-orange-300/12">
                  <CircleUserRound className="h-7 w-7 text-orange-100" />
                </div>

                <div>
                  <p className="text-base font-bold text-white">{roleLabel}</p>
                  <p className="text-sm text-white/58">Sistem Internal</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 md:px-6 xl:px-10 xl:py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-white md:text-5xl xl:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
              Admin menerima laporan yang dikirim user, melihat foto barang yang
              rusak, lalu menentukan apakah laporan disetujui atau ditolak.
            </p>
          </header>

          {message ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
              {message}
            </div>
          ) : null}

          <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-white/12 bg-white/[0.085] p-5 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
                Total Laporan
              </p>
              <p className="mt-3 text-5xl font-extrabold text-white">{totalReports}</p>
              <p className="mt-3 text-sm text-white/60">Semua laporan yang masuk.</p>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/[0.085] p-5 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
                Menunggu
              </p>
              <p className="mt-3 text-5xl font-extrabold text-white">{waitingReports}</p>
              <p className="mt-3 text-sm text-white/60">Menunggu keputusan admin.</p>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/[0.085] p-5 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
                Disetujui
              </p>
              <p className="mt-3 text-5xl font-extrabold text-white">{approvedReports}</p>
              <p className="mt-3 text-sm text-white/60">Sudah disetujui untuk diperbaiki.</p>
            </div>

            <div className="rounded-[28px] border border-white/12 bg-white/[0.085] p-5 backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
                Ditolak
              </p>
              <p className="mt-3 text-5xl font-extrabold text-white">{rejectedReports}</p>
              <p className="mt-3 text-sm text-white/60">Laporan yang ditolak admin.</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] shadow-[0_24px_60px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/68">
                  Latest reports
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-white">
                  Laporan Masuk
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-white/70">Memuat laporan...</div>
            ) : reports.length === 0 ? (
              <div className="px-6 py-8 text-white/70">Belum ada laporan masuk.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-white/8 text-white/58">
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                        ID
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Pelapor
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Kategori
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Barang
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Tanggal
                      </th>
                      <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.24em]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-white/6 transition duration-200 hover:bg-white/[0.06]"
                      >
                        <td className="px-6 py-5">
                          <div className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-sm font-bold tracking-wide text-cyan-50">
                            LP-{String(report.id).padStart(4, "0")}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-300/18 bg-orange-300/10">
                              <CircleUserRound className="h-6 w-6 text-orange-200" />
                            </div>

                            <div>
                              <p className="font-semibold text-white">{report.user.nama}</p>
                              <p className="text-sm text-white/48">{report.user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-white/80">
                          {formatKategori(report.kategori)}
                        </td>

                        <td className="px-6 py-5 text-white/80">{report.namaBarang}</td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] ${getStatusClass(
                              report.status
                            )}`}
                          >
                            {formatStatus(report.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/78">
                            <CalendarDays className="h-4 w-4 text-white/55" />
                            <span>{formatTanggal(report.createdAt)}</span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReport(report);
                              setAlasanPenolakan(report.alasanPenolakan || "");
                              setMessage("");
                            }}
                            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/72 transition hover:bg-white/[0.10] hover:text-white"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedReport ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Detail Laporan</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedReport(null);
                  setAlasanPenolakan("");
                  setMessage("");
                }}
                className="rounded-xl border border-white/10 bg-white/10 p-2 hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/60">Pelapor</p>
                  <p className="text-lg font-semibold">{selectedReport.user.nama}</p>
                </div>

                <div>
                  <p className="text-sm text-white/60">Email</p>
                  <p className="text-lg font-semibold">{selectedReport.user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-white/60">Kategori</p>
                  <p className="text-lg font-semibold">
                    {formatKategori(selectedReport.kategori)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/60">Nama Barang</p>
                  <p className="text-lg font-semibold">{selectedReport.namaBarang}</p>
                </div>

                <div>
                  <p className="text-sm text-white/60">Lokasi</p>
                  <p className="text-lg font-semibold">{selectedReport.lokasi}</p>
                </div>

                <div>
                  <p className="text-sm text-white/60">Tingkat Kerusakan</p>
                  <p className="text-lg font-semibold">
                    {formatSeverity(selectedReport.severity)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/60">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] ${getStatusClass(
                      selectedReport.status
                    )}`}
                  >
                    {formatStatus(selectedReport.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-white/60">Foto Barang</p>
                {selectedReport.fotoUrl ? (
                  <img
                    src={selectedReport.fotoUrl}
                    alt={selectedReport.namaBarang}
                    className="w-full rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-white/50">
                    Tidak ada foto
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm text-white/60">Deskripsi Kerusakan</p>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/85">
                {selectedReport.deskripsi}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm text-white/60">
                Alasan Penolakan
              </label>
              <textarea
                value={alasanPenolakan}
                onChange={(e) => setAlasanPenolakan(e.target.value)}
                rows={4}
                placeholder="Isi alasan jika laporan ditolak..."
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35"
              />
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                {message}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleApprove(selectedReport.id)}
                disabled={submitLoading}
                className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
              >
                {submitLoading ? "Memproses..." : "Setujui"}
              </button>

              <button
                type="button"
                onClick={() => handleReject(selectedReport.id)}
                disabled={submitLoading}
                className="rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-400 disabled:opacity-60"
              >
                {submitLoading ? "Memproses..." : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}