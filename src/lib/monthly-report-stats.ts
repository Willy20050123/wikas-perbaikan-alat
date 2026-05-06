import "server-only";

import { prisma } from "@/src/lib/prisma";
import type { MonthlyStatsResponse } from "@/src/lib/monthly-report-stats-types";

type ReportStatus =
  | "MENUNGGU"
  | "DISETUJUI"
  | "DITOLAK"
  | "DIPROSES"
  | "SELESAI";

type ReportCategory =
  | "FASILITAS_INVENTARIS"
  | "IT_ELEKTRONIK"
  | "LABORATORIUM";

type MonthlyReportStatsInput = {
  month?: number | string | null;
  year?: number | string | null;
  status?: string | null;
};

const REPORT_CATEGORIES: ReportCategory[] = [
  "IT_ELEKTRONIK",
  "FASILITAS_INVENTARIS",
  "LABORATORIUM",
];

const REPORT_STATUSES: ReportStatus[] = [
  "MENUNGGU",
  "DISETUJUI",
  "DITOLAK",
  "DIPROSES",
  "SELESAI",
];

function getMonthRange(year: number, monthIndex: number) {
  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);

  return { start, end };
}

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }

  return null;
}

function parseMonth(value: number | string | null | undefined, fallback: number) {
  const parsed = parseNumber(value);

  if (parsed === null || Number.isNaN(parsed) || parsed < 1 || parsed > 12) {
    return fallback;
  }

  return parsed;
}

function parseYear(value: number | string | null | undefined, fallback: number) {
  const parsed = parseNumber(value);

  if (parsed === null || Number.isNaN(parsed) || parsed < 2020 || parsed > 2100) {
    return fallback;
  }

  return parsed;
}

function getCategoryLabel(category: ReportCategory) {
  if (category === "FASILITAS_INVENTARIS") return "Fasilitas & Inventaris";
  if (category === "IT_ELEKTRONIK") return "IT & Elektronik";
  return "Laboratorium";
}

function createEmptyStatusCounts(): Record<ReportStatus, number> {
  return {
    MENUNGGU: 0,
    DISETUJUI: 0,
    DITOLAK: 0,
    DIPROSES: 0,
    SELESAI: 0,
  };
}

function createEmptyCategoryCounts(): Record<ReportCategory, number> {
  return {
    FASILITAS_INVENTARIS: 0,
    IT_ELEKTRONIK: 0,
    LABORATORIUM: 0,
  };
}

function getTopCategoryLabel(categoryCounts: Record<ReportCategory, number>) {
  let topCategory: ReportCategory | null = null;
  let topCount = 0;

  for (const category of REPORT_CATEGORIES) {
    const count = categoryCounts[category];

    if (count > topCount) {
      topCategory = category;
      topCount = count;
    }
  }

  return topCategory ? getCategoryLabel(topCategory) : "-";
}

async function getDefaultStatsPeriod(now: Date) {
  const latestReport = await prisma.report.findFirst({
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const baseDate = latestReport?.createdAt ?? now;

  return {
    month: baseDate.getMonth() + 1,
    year: baseDate.getFullYear(),
  };
}

export async function getMonthlyReportStats(
  input: MonthlyReportStatsInput = {}
): Promise<MonthlyStatsResponse> {
  const now = new Date();
  const defaultPeriod = await getDefaultStatsPeriod(now);

  const month = parseMonth(input.month, defaultPeriod.month);
  const year = parseYear(input.year, defaultPeriod.year);
  const statusFilter = input.status;

  const selectedStatus: ReportStatus | "SEMUA" =
    statusFilter && REPORT_STATUSES.includes(statusFilter as ReportStatus)
      ? (statusFilter as ReportStatus)
      : "SEMUA";

  const { start, end } = getMonthRange(year, month - 1);

  const reports = await prisma.report.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
      ...(selectedStatus !== "SEMUA" ? { status: selectedStatus } : {}),
    },
    select: {
      userId: true,
      kategori: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          nama: true,
          nip: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const uniqueReporterIds = new Set<number>();
  const statusCounts = createEmptyStatusCounts();
  const categoryCounts = createEmptyCategoryCounts();
  const reporterMap = new Map<
    number,
    {
      userId: number;
      nama: string;
      nip: string | null;
      totalReports: number;
      lastStatus: ReportStatus;
      latestReportAt: string;
      latestReportAtMs: number;
      categoryCounts: Record<ReportCategory, number>;
    }
  >();

  for (const report of reports) {
    const status = report.status as ReportStatus;
    const category = report.kategori as ReportCategory;
    const createdAtMs = report.createdAt.getTime();

    uniqueReporterIds.add(report.userId);
    statusCounts[status] += 1;
    categoryCounts[category] += 1;

    const current = reporterMap.get(report.userId);

    if (!current) {
      const reporterCategoryCounts = createEmptyCategoryCounts();
      reporterCategoryCounts[category] = 1;

      reporterMap.set(report.userId, {
        userId: report.user.id,
        nama: report.user.nama,
        nip: report.user.nip,
        totalReports: 1,
        lastStatus: status,
        latestReportAt: report.createdAt.toISOString(),
        latestReportAtMs: createdAtMs,
        categoryCounts: reporterCategoryCounts,
      });
      continue;
    }

    current.totalReports += 1;
    current.categoryCounts[category] += 1;

    if (createdAtMs > current.latestReportAtMs) {
      current.lastStatus = status;
      current.latestReportAt = report.createdAt.toISOString();
      current.latestReportAtMs = createdAtMs;
    }
  }

  const reporterStats = Array.from(reporterMap.values())
    .sort((a, b) => {
      if (b.totalReports !== a.totalReports) {
        return b.totalReports - a.totalReports;
      }

      return b.latestReportAtMs - a.latestReportAtMs;
    })
    .map((item) => ({
      userId: item.userId,
      nama: item.nama,
      nip: item.nip,
      totalReports: item.totalReports,
      lastStatus: item.lastStatus,
      topCategory: getTopCategoryLabel(item.categoryCounts),
      latestReportAt: item.latestReportAt,
    }));

  const topReporter = reporterStats[0] || null;

  return {
    month: start.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    }),
    monthNumber: month,
    year,
    selectedStatus,
    summary: {
      totalReports: reports.length,
      totalUniqueReporters: uniqueReporterIds.size,
      totalWaiting: statusCounts.MENUNGGU,
      totalApproved: statusCounts.DISETUJUI,
      totalRejected: statusCounts.DITOLAK,
      totalProcessed: statusCounts.DIPROSES,
      totalFinished: statusCounts.SELESAI,
    },
    categories: {
      items: [
        {
          key: "IT_ELEKTRONIK",
          label: "IT & Elektronik",
          total: categoryCounts.IT_ELEKTRONIK,
        },
        {
          key: "FASILITAS_INVENTARIS",
          label: "Fasilitas & Inventaris",
          total: categoryCounts.FASILITAS_INVENTARIS,
        },
        {
          key: "LABORATORIUM",
          label: "Laboratorium",
          total: categoryCounts.LABORATORIUM,
        },
      ],
    },
    statusBreakdown: [
      {
        key: "DISETUJUI",
        label: "Disetujui",
        total: statusCounts.DISETUJUI,
      },
      {
        key: "DITOLAK",
        label: "Ditolak",
        total: statusCounts.DITOLAK,
      },
      {
        key: "MENUNGGU",
        label: "Menunggu",
        total: statusCounts.MENUNGGU,
      },
      {
        key: "DIPROSES",
        label: "Diproses",
        total: statusCounts.DIPROSES,
      },
      {
        key: "SELESAI",
        label: "Selesai",
        total: statusCounts.SELESAI,
      },
    ],
    topReporter,
    reporterStats,
  };
}
