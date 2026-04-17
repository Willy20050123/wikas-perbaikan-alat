"use client";

import type { ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Trophy,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { formatStatus, type ReportStatus } from "@/lib/report-helpers";

type MonthlySummary = {
  totalReports: number;
  totalUniqueReporters: number;
  totalWaiting: number;
  totalApproved: number;
  totalRejected: number;
  totalProcessed: number;
  totalFinished: number;
};

type TopReporter = {
  userId: number;
  nama: string;
  email: string;
  totalReports: number;
  lastStatus: ReportStatus;
  topCategory: string;
  latestReportAt: string;
} | null;

type CategoryItem = {
  key: string;
  label: string;
  total: number;
};

type StatusItem = {
  key: string;
  label: string;
  total: number;
};

type MonthlyStatsCardsProps = {
  monthLabel: string;
  selectedStatus: ReportStatus | "SEMUA";
  summary: MonthlySummary;
  categories: CategoryItem[];
  statusBreakdown: StatusItem[];
  topReporter: TopReporter;
};

type StatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  iconWrapperClass: string;
  glowClass: string;
};

function StatCard({
  title,
  value,
  description,
  icon,
  iconWrapperClass,
  glowClass,
}: StatCardProps) {
  return (
    <div
      className={`rounded-[28px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.16)] backdrop-blur-xl ${glowClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
            {title}
          </p>
          <p className="mt-3 text-5xl font-extrabold tracking-[-0.03em] text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconWrapperClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-white/60">{description}</p>
    </div>
  );
}

function getStatusDotClass(statusKey: string) {
  if (statusKey === "DISETUJUI") return "bg-emerald-300";
  if (statusKey === "DITOLAK") return "bg-rose-300";
  if (statusKey === "MENUNGGU") return "bg-amber-300";
  if (statusKey === "DIPROSES") return "bg-cyan-300";
  return "bg-blue-300";
}

function getBarClass(index: number) {
  const classes = [
    "bg-gradient-to-b from-emerald-300 to-cyan-400",
    "bg-gradient-to-b from-amber-300 to-yellow-500",
    "bg-gradient-to-b from-blue-300 to-indigo-500",
  ];

  return classes[index] || "bg-gradient-to-b from-cyan-300 to-blue-500";
}

export default function MonthlyStatsCards({
  monthLabel,
  selectedStatus,
  summary,
  categories,
  statusBreakdown,
  topReporter,
}: MonthlyStatsCardsProps) {
  const totalStatus = statusBreakdown.reduce((sum, item) => sum + item.total, 0);

  const maxCategory =
    categories.length > 0 ? Math.max(...categories.map((item) => item.total), 1) : 1;

  const approvalRate =
    summary.totalReports > 0
      ? Math.round((summary.totalApproved / summary.totalReports) * 100)
      : 0;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
          Statistik Bulanan
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
          Ringkasan Laporan {monthLabel}
        </h2>
        <p className="mt-3 max-w-3xl text-white/70">
          Rekap laporan berdasarkan periode terpilih, termasuk jumlah pelapor
          unik, distribusi status, kategori terbanyak, dan pelapor paling aktif.
        </p>
        <div className="mt-4 inline-flex rounded-full border border-cyan-300/18 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          Filter status:{" "}
          <span className="ml-2">{selectedStatus === "SEMUA" ? "Semua Status" : formatStatus(selectedStatus)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Laporan"
          value={summary.totalReports}
          description="Semua laporan pada periode terpilih."
          icon={<BarChart3 className="h-5 w-5 text-cyan-100" />}
          iconWrapperClass="border-cyan-300/18 bg-cyan-400/10"
          glowClass="shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_18px_40px_rgba(2,6,23,0.22)]"
        />

        <StatCard
          title="Pelapor Unik"
          value={summary.totalUniqueReporters}
          description="Jumlah pegawai yang membuat laporan."
          icon={<Users className="h-5 w-5 text-emerald-100" />}
          iconWrapperClass="border-emerald-300/18 bg-emerald-400/10"
          glowClass="shadow-[0_0_0_1px_rgba(52,211,153,0.10),0_18px_40px_rgba(2,6,23,0.22)]"
        />

        <StatCard
          title="Disetujui"
          value={summary.totalApproved}
          description="Data laporan yang diterima admin."
          icon={<BadgeCheck className="h-5 w-5 text-emerald-100" />}
          iconWrapperClass="border-emerald-300/18 bg-emerald-400/10"
          glowClass="shadow-[0_0_0_1px_rgba(74,222,128,0.10),0_18px_40px_rgba(2,6,23,0.22)]"
        />

        <StatCard
          title="Ditolak"
          value={summary.totalRejected}
          description="Laporan yang ditolak admin."
          icon={<XCircle className="h-5 w-5 text-rose-100" />}
          iconWrapperClass="border-rose-300/18 bg-rose-400/10"
          glowClass="shadow-[0_0_0_1px_rgba(251,113,133,0.10),0_18px_40px_rgba(2,6,23,0.22)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          title="Menunggu"
          value={summary.totalWaiting}
          description="Menunggu keputusan admin."
          icon={<Clock3 className="h-5 w-5 text-amber-100" />}
          iconWrapperClass="border-amber-300/18 bg-amber-400/10"
          glowClass=""
        />

        <StatCard
          title="Diproses"
          value={summary.totalProcessed}
          description="Sedang ditindaklanjuti."
          icon={<Activity className="h-5 w-5 text-cyan-100" />}
          iconWrapperClass="border-cyan-300/18 bg-cyan-400/10"
          glowClass=""
        />

        <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.16)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/75">
                Pelapor Terbanyak
              </p>
              <p className="mt-3 text-2xl font-extrabold text-white">
                {topReporter?.nama || "-"}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-400/10">
              <Trophy className="h-5 w-5 text-amber-100" />
            </div>
          </div>

          <p className="mt-3 text-sm text-white/60">
            {topReporter
              ? `${topReporter.totalReports} laporan • ${topReporter.topCategory}`
              : "Belum ada data pelapor bulan ini."}
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/55">Status terakhir</p>
            <p className="mt-1 font-semibold text-white">
              {topReporter ? formatStatus(topReporter.lastStatus) : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_1fr_1fr]">
        <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.16)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-white">
              Jumlah Laporan per Kategori
            </h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <BarChart3 className="h-5 w-5 text-white/80" />
            </div>
          </div>

          <div className="mt-8 grid h-[260px] grid-cols-3 items-end gap-6">
            {categories.map((item, index) => {
              const height =
                item.total > 0 ? Math.max((item.total / maxCategory) * 180, 24) : 8;

              return (
                <div key={item.key} className="flex flex-col items-center gap-4">
                  <div className="text-sm font-semibold text-white/80">
                    {item.total}
                  </div>
                  <div className="flex h-[180px] items-end">
                    <div
                      className={`w-16 rounded-t-2xl shadow-[0_10px_30px_rgba(0,0,0,0.18)] ${getBarClass(
                        index
                      )}`}
                      style={{ height }}
                    />
                  </div>
                  <div className="text-center text-sm leading-5 text-white/70">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.16)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-white">Status Laporan</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <CheckCircle2 className="h-5 w-5 text-white/80" />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[16px] border-cyan-400/15">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    rgba(45,212,191,0.95) 0deg ${
                      totalStatus > 0
                        ? (statusBreakdown[0]?.total || 0) / totalStatus * 360
                        : 0
                    }deg,
                    rgba(251,113,133,0.95) ${
                      totalStatus > 0
                        ? (statusBreakdown[0]?.total || 0) / totalStatus * 360
                        : 0
                    }deg ${
                      totalStatus > 0
                        ? ((statusBreakdown[0]?.total || 0) +
                            (statusBreakdown[1]?.total || 0)) /
                            totalStatus *
                            360
                        : 0
                    }deg,
                    rgba(252,211,77,0.95) ${
                      totalStatus > 0
                        ? ((statusBreakdown[0]?.total || 0) +
                            (statusBreakdown[1]?.total || 0)) /
                            totalStatus *
                            360
                        : 0
                    }deg ${
                      totalStatus > 0
                        ? ((statusBreakdown[0]?.total || 0) +
                            (statusBreakdown[1]?.total || 0) +
                            (statusBreakdown[2]?.total || 0)) /
                            totalStatus *
                            360
                        : 0
                    }deg,
                    rgba(56,189,248,0.95) ${
                      totalStatus > 0
                        ? ((statusBreakdown[0]?.total || 0) +
                            (statusBreakdown[1]?.total || 0) +
                            (statusBreakdown[2]?.total || 0)) /
                            totalStatus *
                            360
                        : 0
                    }deg 360deg
                  )`,
                }}
              />
              <div className="absolute inset-[18px] rounded-full bg-slate-950" />
              <div className="relative z-10 text-center">
                <p className="text-5xl font-extrabold text-white">
                  {summary.totalReports}
                </p>
                <p className="mt-1 text-sm text-white/60">Laporan</p>
              </div>
            </div>

            <div className="mt-8 w-full space-y-3">
              {statusBreakdown.slice(0, 4).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusDotClass(item.key)}`}
                    />
                    <span className="text-lg text-white/85">{item.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {item.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.16)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-white">Status Laporan</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <UserRound className="h-5 w-5 text-white/80" />
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {statusBreakdown.map((item) => {
              const percent =
                totalStatus > 0 ? Math.round((item.total / totalStatus) * 100) : 0;

              return (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusDotClass(item.key)}`}
                    />
                    <span className="text-lg text-white/85">{item.label}</span>
                  </div>
                  <span className="text-xl font-semibold text-white">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/75">
              Approval Rate
            </p>
            <p className="mt-2 text-3xl font-extrabold text-white">
              {approvalRate}%
            </p>
            <p className="mt-2 text-sm text-white/60">
              Persentase laporan yang berhasil disetujui.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}