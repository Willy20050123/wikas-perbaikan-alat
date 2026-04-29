"use client";

import { memo, type ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  LayoutGrid,
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
};

type StatTileProps = {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
  accentClass: string;
};

function StatTile({
  title,
  value,
  description,
  icon,
  accentClass,
}: StatTileProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.16)] sm:rounded-[26px]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${accentClass}`}>
          {icon}
        </div>
        <p className="text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
          {value}
        </p>
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
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

function getStatusBarClass(statusKey: string) {
  if (statusKey === "DISETUJUI") return "bg-emerald-300";
  if (statusKey === "DITOLAK") return "bg-rose-300";
  if (statusKey === "MENUNGGU") return "bg-amber-300";
  if (statusKey === "DIPROSES") return "bg-cyan-300";
  return "bg-blue-300";
}

function MonthlyStatsCards({
  monthLabel,
  selectedStatus,
  summary,
  categories,
  statusBreakdown,
}: MonthlyStatsCardsProps) {
  const totalStatus = statusBreakdown.reduce((sum, item) => sum + item.total, 0);
  const maxCategory =
    categories.length > 0 ? Math.max(...categories.map((item) => item.total), 1) : 1;
  const approvalRate =
    summary.totalReports > 0
      ? Math.round((summary.totalApproved / summary.totalReports) * 100)
      : 0;
  const dominantStatus =
    statusBreakdown.length > 0
      ? [...statusBreakdown].sort((a, b) => b.total - a.total)[0]
      : null;

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-cyan-300/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.18)] sm:rounded-[32px] sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/75">
          Panel Ringkasan
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white">
          Snapshot {monthLabel}
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Ringkasan cepat untuk periode aktif, lengkap dengan kategori,
          distribusi status, dan rasio persetujuan.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50">
            {selectedStatus === "SEMUA"
              ? "Semua Status"
              : formatStatus(selectedStatus)}
          </span>
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white/82">
            {summary.totalReports} laporan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile
          title="Total Laporan"
          value={summary.totalReports}
          description="Semua laporan pada periode aktif."
          icon={<BarChart3 className="h-5 w-5 text-cyan-100" />}
          accentClass="border-cyan-300/18 bg-cyan-400/10"
        />
        <StatTile
          title="Pelapor Unik"
          value={summary.totalUniqueReporters}
          description="Pegawai berbeda yang melapor."
          icon={<Users className="h-5 w-5 text-emerald-100" />}
          accentClass="border-emerald-300/18 bg-emerald-400/10"
        />
        <StatTile
          title="Disetujui"
          value={summary.totalApproved}
          description="Laporan yang lolos verifikasi."
          icon={<BadgeCheck className="h-5 w-5 text-emerald-100" />}
          accentClass="border-emerald-300/18 bg-emerald-400/10"
        />
        <StatTile
          title="Ditolak"
          value={summary.totalRejected}
          description="Laporan yang tidak dilanjutkan."
          icon={<XCircle className="h-5 w-5 text-rose-100" />}
          accentClass="border-rose-300/18 bg-rose-400/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 sm:rounded-[24px]">
          <Clock3 className="h-5 w-5 text-amber-100" />
          <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">
            {summary.totalWaiting}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
            Menunggu
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 sm:rounded-[24px]">
          <Activity className="h-5 w-5 text-cyan-100" />
          <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">
            {summary.totalProcessed}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
            Diproses
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4 sm:rounded-[24px]">
          <CheckCircle2 className="h-5 w-5 text-blue-100" />
          <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">
            {summary.totalFinished}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
            Selesai
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.16)] sm:rounded-[28px] sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/52">
              Komposisi Kategori
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">
              Laporan per Kategori
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <LayoutGrid className="h-5 w-5 text-white/80" />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {categories.map((item, index) => {
            const width = maxCategory > 0 ? (item.total / maxCategory) * 100 : 0;
            const barClass =
              index === 0
                ? "bg-emerald-300"
                : index === 1
                  ? "bg-amber-300"
                  : "bg-blue-300";

            return (
              <div key={item.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-white/82">{item.label}</span>
                  <span className="font-semibold text-white">{item.total}</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-white/7">
                  <div
                    className={`h-2.5 rounded-full ${barClass}`}
                    style={{ width: `${Math.max(width, item.total > 0 ? 10 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.07] p-4 shadow-[0_18px_40px_rgba(2,6,23,0.16)] sm:rounded-[28px] sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/52">
              Distribusi Status
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">
              Ringkasan Progres
            </h3>
          </div>

          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/75">
              Approval
            </p>
            <p className="mt-1 text-xl font-black tracking-[-0.03em] text-white sm:text-2xl">
              {approvalRate}%
            </p>
          </div>
        </div>

        {dominantStatus ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">
              Status Dominan
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {dominantStatus.label}
            </p>
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {statusBreakdown.map((item) => {
            const percent =
              totalStatus > 0 ? Math.round((item.total / totalStatus) * 100) : 0;

            return (
              <div key={item.key}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusDotClass(item.key)}`}
                    />
                    <span className="font-medium text-white/82">{item.label}</span>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">{item.total}</p>
                    <p className="text-xs text-white/45">{percent}%</p>
                  </div>
                </div>

                <div className="mt-2 h-2 rounded-full bg-white/7">
                  <div
                    className={`h-2 rounded-full ${getStatusBarClass(item.key)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(MonthlyStatsCards);
