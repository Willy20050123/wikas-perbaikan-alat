"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  CalendarDays,
  History,
  ImagePlus,
  KeyRound,
  LogOut,
  UserCog,
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
  currentUser: {
    id: number;
    nama: string;
    jabatan: string | null;
    nip: string | null;
    role: "ADMIN";
  };
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
  completionPhotoUrl?: string | null;
  status: ReportStatus;
  alasanPenolakan: string | null;
  assignedTechnician?: string | null;
  adminNotes?: string | null;
  completionNotes?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  processedAt?: string | null;
  finishedAt?: string | null;
  user: {
    id: number;
    nama: string;
    jabatan?: string | null;
    nip: string | null;
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getWorkflowValidationMessage(
  action: "APPROVE" | "REJECT" | "START_PROCESS" | "COMPLETE",
  input: {
    alasanPenolakan: string;
    assignedTechnician: string;
    completionNotes: string;
    completionPhoto: File | null;
  },
) {
  if (action === "REJECT" && !input.alasanPenolakan.trim()) {
    return "Alasan penolakan wajib diisi sebelum laporan ditolak.";
  }

  if (action === "START_PROCESS" && !input.assignedTechnician.trim()) {
    return "Nama penanggung jawab wajib diisi sebelum memulai proses.";
  }

  if (
    action === "COMPLETE" &&
    !input.completionNotes.trim() &&
    !input.completionPhoto
  ) {
    return "Isi catatan penyelesaian atau upload foto bukti terlebih dahulu.";
  }

  return null;
}

export default function AdminDashboard({
  currentUser,
  title = "Dashboard Laporan Kerusakan Barang & Alat",
}: AdminDashboardProps) {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhoto, setCompletionPhoto] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReports() {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/admin", { cache: "no-store" });
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

  async function handleLogout() {
    const res = await fetch("/api/logout", { method: "POST" });

    if (!res.ok) {
      setMessage("Logout gagal.");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  function openReportDetail(report: ReportItem) {
    setSelectedReport(report);
    setAlasanPenolakan(report.alasanPenolakan || "");
    setAssignedTechnician(report.assignedTechnician || "");
    setAdminNotes(report.adminNotes || "");
    setCompletionNotes(report.completionNotes || "");
    setCompletionPhoto(null);
    setMessage("");
  }

  function closeReportDetail() {
    setSelectedReport(null);
    setAlasanPenolakan("");
    setAssignedTechnician("");
    setAdminNotes("");
    setCompletionNotes("");
    setCompletionPhoto(null);
  }

  async function submitWorkflow(
    action: "APPROVE" | "REJECT" | "START_PROCESS" | "COMPLETE",
  ) {
    if (!selectedReport) {
      return;
    }

    const validationMessage = getWorkflowValidationMessage(action, {
      alasanPenolakan,
      assignedTechnician,
      completionNotes,
      completionPhoto,
    });

    if (validationMessage) {
      toast.warning("Data belum lengkap", {
        description: validationMessage,
      });
      setMessage(validationMessage);
      return;
    }

    try {
      setSubmitLoading(true);

      const formData = new FormData();
      formData.append("action", action);
      formData.append("alasanPenolakan", alasanPenolakan);
      formData.append("assignedTechnician", assignedTechnician);
      formData.append("adminNotes", adminNotes);
      formData.append("completionNotes", completionNotes);

      if (completionPhoto) {
        formData.append("completionPhoto", completionPhoto);
      }

      const res = await fetch(`/api/reports/${selectedReport.id}/decide`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.message || "Gagal memperbarui workflow laporan.";

        setMessage(errorMessage);
        toast.error("Gagal memperbarui laporan", {
          description: errorMessage,
        });
        return;
      }

      const successMessage =
        data.message || "Workflow laporan berhasil diperbarui.";

      setMessage(successMessage);
      toast.success("Laporan diperbarui", {
        description: successMessage,
      });
      closeReportDetail();
      await loadReports();
    } catch (error) {
      console.error("SUBMIT_WORKFLOW_ERROR:", error);
      const errorMessage =
        "Terjadi kesalahan saat memperbarui workflow laporan.";

      setMessage(errorMessage);
      toast.error("Gagal memperbarui laporan", {
        description: errorMessage,
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  const summary = useMemo(
    () => ({
      total: reports.length,
      menunggu: reports.filter((report) => report.status === "MENUNGGU").length,
      disetujui: reports.filter((report) => report.status === "DISETUJUI")
        .length,
      diproses: reports.filter((report) => report.status === "DIPROSES").length,
      selesai: reports.filter((report) => report.status === "SELESAI").length,
    }),
    [reports],
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
              Admin Panel
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-white/70">
              Review laporan, setujui atau tolak, lanjutkan ke proses perbaikan,
              lalu tutup pekerjaan dengan catatan dan bukti penyelesaian.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/history")}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
            >
              <History className="h-4 w-4" />
              Riwayat
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/statistik")}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
            >
              <BarChart3 className="h-4 w-4" />
              Statistik
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin/users")}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
            >
              <UserCog className="h-4 w-4" />
              Kelola User
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/account")}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
            >
              <KeyRound className="h-4 w-4" />
              Akun
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/18 bg-rose-400/10 px-5 py-3 font-semibold text-rose-50 transition hover:bg-rose-400/15"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="rounded-[28px] border border-white/12 bg-white/[0.085] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              Admin Aktif
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-50">
                {getInitials(currentUser.nama) || "AD"}
              </div>
              <div>
                <p className="font-semibold text-white">{currentUser.nama}</p>
                <p className="text-sm text-white/60">
                  {currentUser.jabatan || "Admin Sistem"}
                </p>
                <p className="text-xs text-white/45">
                  NIP: {currentUser.nip || "-"}
                </p>
              </div>
            </div>
          </div>

          {[
            ["Total", summary.total, "Semua laporan masuk."],
            ["Menunggu", summary.menunggu, "Belum diputuskan admin."],
            ["Disetujui", summary.disetujui, "Siap dikerjakan."],
            ["Diproses", summary.diproses, "Sedang dikerjakan."],
            ["Selesai", summary.selesai, "Pekerjaan ditutup."],
          ].map(([label, value, description]) => (
            <div
              key={String(label)}
              className="rounded-[28px] border border-white/12 bg-white/[0.085] p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
                {label}
              </p>
              <p className="mt-3 text-5xl font-extrabold text-white">{value}</p>
              <p className="mt-3 text-sm text-white/60">{description}</p>
            </div>
          ))}
        </section>

        {message ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
            {message}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] shadow-[0_24px_60px_rgba(2,6,23,0.16)]">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-bold text-white">Laporan Masuk</h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-white/70">Memuat laporan...</div>
          ) : reports.length === 0 ? (
            <div className="px-6 py-8 text-white/70">
              Belum ada laporan masuk.
            </div>
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
                      Barang
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                      PJ
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
                      className="border-b border-white/6 transition hover:bg-white/[0.06]"
                    >
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-sm font-bold tracking-wide text-cyan-50">
                          LP-{String(report.id).padStart(4, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">
                          {report.user.nama}
                        </p>
                        <p className="text-sm text-white/48">
                          NIP: {report.user.nip || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-white/80">
                        {report.namaBarang}
                      </td>
                      <td className="px-6 py-5 text-white/80">
                        {formatKategori(report.kategori)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] ${getStatusClass(
                            report.status,
                          )}`}
                        >
                          {formatStatus(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-white/70">
                        {report.assignedTechnician || "-"}
                      </td>
                      <td className="px-6 py-5 text-white/80">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/78">
                          <CalendarDays className="h-4 w-4 text-white/55" />
                          {formatTanggal(report.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openReportDetail(report)}
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

        {selectedReport ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={closeReportDetail}
          >
            <div
              className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Detail Laporan</h3>
                  <p className="mt-1 text-sm text-white/55">
                    Kelola workflow laporan dari keputusan awal sampai
                    penyelesaian.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeReportDetail}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 hover:bg-white/15"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.9fr]">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-sm font-bold tracking-wide text-cyan-50">
                        LP-{String(selectedReport.id).padStart(4, "0")}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] ${getStatusClass(
                          selectedReport.status,
                        )}`}
                      >
                        {formatStatus(selectedReport.status)}
                      </span>
                    </div>

                    <h4 className="mt-4 text-2xl font-bold text-white">
                      {selectedReport.namaBarang}
                    </h4>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/55">Pelapor</p>
                        <p className="mt-1 font-semibold text-white">
                          {selectedReport.user.nama}
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          NIP: {selectedReport.user.nip || "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/55">
                          Penanggung Jawab
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          {selectedReport.assignedTechnician || "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/55">Kategori</p>
                        <p className="mt-1 font-semibold text-white">
                          {formatKategori(selectedReport.kategori)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/55">Severity</p>
                        <p className="mt-1 font-semibold text-white">
                          {formatSeverity(selectedReport.severity)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/55">Lokasi</p>
                        <p className="mt-1 font-semibold text-white">
                          {selectedReport.lokasi}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/55">Tanggal</p>
                        <p className="mt-1 font-semibold text-white">
                          {formatTanggal(selectedReport.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/55">
                        Deskripsi Kerusakan
                      </p>
                      <p className="mt-2 whitespace-pre-line leading-7 text-white/85">
                        {selectedReport.deskripsi}
                      </p>
                    </div>

                    {selectedReport.alasanPenolakan ? (
                      <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4">
                        <p className="text-sm font-semibold text-rose-100">
                          Alasan Penolakan
                        </p>
                        <p className="mt-2 text-rose-50/90">
                          {selectedReport.alasanPenolakan}
                        </p>
                      </div>
                    ) : null}

                    {selectedReport.adminNotes ? (
                      <div className="mt-4 rounded-2xl border border-cyan-300/18 bg-cyan-400/10 p-4">
                        <p className="text-sm font-semibold text-cyan-50">
                          Catatan Internal
                        </p>
                        <p className="mt-2 whitespace-pre-line text-cyan-50/90">
                          {selectedReport.adminNotes}
                        </p>
                      </div>
                    ) : null}

                    {selectedReport.completionNotes ? (
                      <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-400/10 p-4">
                        <p className="text-sm font-semibold text-emerald-50">
                          Catatan Penyelesaian
                        </p>
                        <p className="mt-2 whitespace-pre-line text-emerald-50/90">
                          {selectedReport.completionNotes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
                    <p className="mb-3 text-sm text-white/55">Foto Barang</p>
                    {selectedReport.fotoUrl ? (
                      <div className="overflow-hidden rounded-2xl border border-white/10">
                        <Image
                          src={selectedReport.fotoUrl}
                          alt={selectedReport.namaBarang}
                          width={1200}
                          height={800}
                          className="w-full object-cover"
                          preload
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-white/50">
                        Tidak ada foto awal
                      </div>
                    )}

                    {selectedReport.completionPhotoUrl ? (
                      <div className="mt-4">
                        <p className="mb-3 text-sm text-white/55">
                          Foto Penyelesaian
                        </p>
                        <div className="overflow-hidden rounded-2xl border border-emerald-300/15">
                          <Image
                            src={selectedReport.completionPhotoUrl}
                            alt={`Penyelesaian ${selectedReport.namaBarang}`}
                            width={1200}
                            height={800}
                            className="w-full object-cover"
                            preload
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
                    <p className="text-sm text-white/55">Workflow Admin</p>

                    <div className="mt-4 space-y-4">
                      {selectedReport.status === "MENUNGGU" ? (
                        <>
                          <textarea
                            value={adminNotes}
                            onChange={(event) =>
                              setAdminNotes(event.target.value)
                            }
                            rows={4}
                            placeholder="Catatan internal admin..."
                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35"
                          />
                          <textarea
                            value={alasanPenolakan}
                            onChange={(event) =>
                              setAlasanPenolakan(event.target.value)
                            }
                            rows={4}
                            placeholder="Isi alasan jika laporan ditolak..."
                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35"
                          />
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => void submitWorkflow("APPROVE")}
                              disabled={submitLoading}
                              className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
                            >
                              {submitLoading ? "Memproses..." : "Setujui"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void submitWorkflow("REJECT")}
                              disabled={submitLoading}
                              className="rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-400 disabled:opacity-60"
                            >
                              {submitLoading ? "Memproses..." : "Tolak"}
                            </button>
                          </div>
                        </>
                      ) : null}

                      {selectedReport.status === "DISETUJUI" ? (
                        <>
                          <input
                            value={assignedTechnician}
                            onChange={(event) =>
                              setAssignedTechnician(event.target.value)
                            }
                            placeholder="Nama penanggung jawab perbaikan"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-white/35"
                          />
                          <textarea
                            value={adminNotes}
                            onChange={(event) =>
                              setAdminNotes(event.target.value)
                            }
                            rows={4}
                            placeholder="Catatan internal sebelum pengerjaan dimulai..."
                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35"
                          />
                          <button
                            type="button"
                            onClick={() => void submitWorkflow("START_PROCESS")}
                            disabled={submitLoading}
                            className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-400 disabled:opacity-60"
                          >
                            {submitLoading ? "Memproses..." : "Mulai Proses"}
                          </button>
                        </>
                      ) : null}

                      {selectedReport.status === "DIPROSES" ? (
                        <>
                          <input
                            value={assignedTechnician}
                            onChange={(event) =>
                              setAssignedTechnician(event.target.value)
                            }
                            placeholder="Nama penanggung jawab perbaikan"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-white/35"
                          />
                          <textarea
                            value={adminNotes}
                            onChange={(event) =>
                              setAdminNotes(event.target.value)
                            }
                            rows={3}
                            placeholder="Catatan internal proses..."
                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35"
                          />
                          <textarea
                            value={completionNotes}
                            onChange={(event) =>
                              setCompletionNotes(event.target.value)
                            }
                            rows={4}
                            placeholder="Catatan penyelesaian pekerjaan..."
                            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35"
                          />
                          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                            <ImagePlus className="h-4 w-4" />
                            <span className="flex-1">
                              Upload bukti penyelesaian (opsional)
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(event) =>
                                setCompletionPhoto(
                                  event.target.files?.[0] || null,
                                )
                              }
                              className="max-w-[220px] text-xs text-white file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-white"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => void submitWorkflow("COMPLETE")}
                            disabled={submitLoading}
                            className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
                          >
                            {submitLoading ? "Memproses..." : "Tandai Selesai"}
                          </button>
                        </>
                      ) : null}

                      {selectedReport.status === "DITOLAK" ||
                      selectedReport.status === "SELESAI" ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                          Tidak ada aksi lanjutan untuk status ini dari
                          dashboard utama. Kamu tetap bisa melihat riwayat dan
                          statistik dari menu utama.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
