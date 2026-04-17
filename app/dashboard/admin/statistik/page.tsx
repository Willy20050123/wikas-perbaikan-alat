"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Filter,
  RefreshCcw,
} from "lucide-react";
import MonthlyStatsCards from "@/src/components/dashboard/MonthlyStatsCards";
import MonthlyReporterTable from "@/src/components/dashboard/MonthlyReporterTable";
import type { ReportStatus } from "@/lib/report-helpers";

type MonthlyStatsResponse = {
  month: string;
  monthNumber: number;
  year: number;
  selectedStatus: ReportStatus | "SEMUA";
  summary: {
    totalReports: number;
    totalUniqueReporters: number;
    totalWaiting: number;
    totalApproved: number;
    totalRejected: number;
    totalProcessed: number;
    totalFinished: number;
  };
  categories: {
    items: Array<{
      key: string;
      label: string;
      total: number;
    }>;
  };
  statusBreakdown: Array<{
    key: string;
    label: string;
    total: number;
  }>;
  topReporter: {
    userId: number;
    nama: string;
    email: string;
    totalReports: number;
    lastStatus: ReportStatus;
    topCategory: string;
    latestReportAt: string;
  } | null;
  reporterStats: Array<{
    userId: number;
    nama: string;
    email: string;
    totalReports: number;
    lastStatus: ReportStatus;
    topCategory: string;
    latestReportAt: string;
  }>;
};

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const STATUS_OPTIONS = [
  { value: "SEMUA", label: "Semua Status" },
  { value: "MENUNGGU", label: "Menunggu" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "DITOLAK", label: "Ditolak" },
  { value: "DIPROSES", label: "Diproses" },
  { value: "SELESAI", label: "Selesai" },
] as const;

export default function AdminStatistikPage() {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStatus, setSelectedStatus] = useState<
    ReportStatus | "SEMUA"
  >("SEMUA");

  const [stats, setStats] = useState<MonthlyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const yearOptions = useMemo(() => {
    const startYear = 2026;
    const endYear = Math.max(currentYear + 4, 2030);

    return Array.from(
      { length: endYear - startYear + 1 },
      (_, index) => startYear + index
    );
  }, [currentYear]);

  const loadStats = useCallback(
    async (
      month: number = selectedMonth,
      year: number = selectedYear,
      status: ReportStatus | "SEMUA" = selectedStatus
    ) => {
      try {
        setLoading(true);
        setMessage("");

        const params = new URLSearchParams({
          month: String(month),
          year: String(year),
        });

        if (status !== "SEMUA") {
          params.set("status", status);
        }

        const res = await fetch(`/api/reports/stats/monthly?${params.toString()}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Gagal memuat statistik bulanan.");
          setStats(null);
          return;
        }

        setStats(data);
      } catch (error) {
        console.error("LOAD_MONTHLY_STATS_ERROR:", error);
        setMessage("Terjadi kesalahan saat memuat statistik bulanan.");
        setStats(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedMonth, selectedYear, selectedStatus]
  );

  function handleApplyFilter() {
    void loadStats(selectedMonth, selectedYear, selectedStatus);
  }

  function handleResetFilter() {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedStatus("SEMUA");
    void loadStats(currentMonth, currentYear, "SEMUA");
  }

  useEffect(() => {
    void loadStats(currentMonth, currentYear, "SEMUA");
  }, [loadStats, currentMonth, currentYear]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              <BarChart3 className="h-4 w-4" />
              Statistik Laporan
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-5xl">
              Statistik Laporan
            </h1>
            <p className="mt-3 max-w-3xl text-white/70">
              Lihat performa laporan berdasarkan bulan, tahun, status, dan
              aktivitas pelapor.
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

        <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.16)] backdrop-blur-2xl md:p-6">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-2xl border border-cyan-300/18 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as ReportStatus | "SEMUA")
              }
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/30"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleApplyFilter}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/18 bg-cyan-400/12 px-5 py-3 font-semibold text-cyan-50 transition hover:bg-cyan-400/18"
            >
              <Filter className="h-4 w-4" />
              Terapkan
            </button>

            <button
              type="button"
              onClick={handleResetFilter}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-3 font-semibold text-white transition hover:bg-white/[0.12]"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>

        {message ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.08] px-6 py-10 text-center text-white/70 backdrop-blur-2xl">
            Memuat statistik bulanan...
          </div>
        ) : stats ? (
          <div className="space-y-8">
            <MonthlyStatsCards
              monthLabel={stats.month}
              selectedStatus={stats.selectedStatus}
              summary={stats.summary}
              categories={stats.categories.items}
              statusBreakdown={stats.statusBreakdown}
              topReporter={stats.topReporter}
            />

            <MonthlyReporterTable
              reporterStats={stats.reporterStats}
              totalReports={stats.summary.totalReports}
              monthLabel={stats.month}
            />
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.08] px-6 py-10 text-center text-white/70 backdrop-blur-2xl">
            Data statistik tidak tersedia.
          </div>
        )}
      </div>
    </div>
  );
}