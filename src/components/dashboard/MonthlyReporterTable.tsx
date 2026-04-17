"use client";

import { CircleUserRound, Mail, Trophy } from "lucide-react";
import {
  formatStatus,
  getStatusClass,
  formatTanggal,
  type ReportStatus,
} from "@/lib/report-helpers";

type ReporterStatItem = {
  userId: number;
  nama: string;
  email: string;
  totalReports: number;
  lastStatus: ReportStatus;
  topCategory: string;
  latestReportAt: string;
};

type MonthlyReporterTableProps = {
  reporterStats: ReporterStatItem[];
  totalReports: number;
  monthLabel: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function MonthlyReporterTable({
  reporterStats,
  totalReports,
  monthLabel,
}: MonthlyReporterTableProps) {
  if (reporterStats.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-white/10 bg-white/[0.06] px-6 py-10 text-center text-white/65">
        Belum ada data laporan pada {monthLabel}.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] shadow-[0_24px_60px_rgba(2,6,23,0.16)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/68">
            Reporter Summary
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-white">
            Rekap Pelapor Bulan Ini
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-50">
          <Trophy className="h-4 w-4" />
          Total pelapor: {reporterStats.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-white/8 text-white/58">
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Rank
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Nama
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Email
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Jumlah
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Kategori Terbanyak
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Persentase
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Status Terakhir
              </th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
                Laporan Terakhir
              </th>
            </tr>
          </thead>

          <tbody>
            {reporterStats.map((item, index) => {
              const contribution =
                totalReports > 0
                  ? Math.round((item.totalReports / totalReports) * 100)
                  : 0;

              return (
                <tr
                  key={item.userId}
                  className="border-b border-white/6 transition duration-200 hover:bg-white/[0.06]"
                >
                  <td className="px-6 py-5">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-400/10 text-sm font-bold text-amber-50">
                      #{index + 1}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex min-w-[220px] items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10">
                        {getInitials(item.nama) ? (
                          <span className="text-sm font-bold text-cyan-50">
                            {getInitials(item.nama)}
                          </span>
                        ) : (
                          <CircleUserRound className="h-6 w-6 text-cyan-100" />
                        )}
                      </div>
                      <p className="font-semibold text-white">{item.nama}</p>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-white/70">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-white/45" />
                      <span>{item.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-sm font-bold tracking-wide text-cyan-50">
                      {item.totalReports} laporan
                    </span>
                  </td>

                  <td className="px-6 py-5 text-white/80">{item.topCategory}</td>

                  <td className="px-6 py-5 min-w-[180px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-white/60">Kontribusi</span>
                        <span className="font-semibold text-white">
                          {contribution}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/8">
                        <div
                          className="h-2.5 rounded-full bg-cyan-300"
                          style={{ width: `${contribution}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-[0.16em] ${getStatusClass(
                        item.lastStatus
                      )}`}
                    >
                      {formatStatus(item.lastStatus)}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-white/80">
                    {formatTanggal(item.latestReportAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}