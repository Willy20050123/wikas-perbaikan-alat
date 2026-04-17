import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/src/lib/auth";

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

function getMonthRange(year: number, monthIndex: number) {
  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);

  return { start, end };
}

function parseMonth(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 1 || parsed > 12) {
    return fallback;
  }

  return parsed;
}

function parseYear(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);

  if (Number.isNaN(parsed) || parsed < 2020 || parsed > 2100) {
    return fallback;
  }

  return parsed;
}

function getCategoryLabel(category: ReportCategory) {
  if (category === "FASILITAS_INVENTARIS") return "Fasilitas & Inventaris";
  if (category === "IT_ELEKTRONIK") return "IT & Elektronik";
  return "Laboratorium";
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authUser = verifyAuthToken(token);

    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const searchParams = request.nextUrl.searchParams;

    const month = parseMonth(searchParams.get("month"), now.getMonth() + 1);
    const year = parseYear(searchParams.get("year"), now.getFullYear());
    const statusFilter = searchParams.get("status");

    const { start, end } = getMonthRange(year, month - 1);

    const reports = await prisma.report.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const allowedStatuses: ReportStatus[] = [
      "MENUNGGU",
      "DISETUJUI",
      "DITOLAK",
      "DIPROSES",
      "SELESAI",
    ];

    const selectedStatus: ReportStatus | "SEMUA" =
      statusFilter && allowedStatuses.includes(statusFilter as ReportStatus)
        ? (statusFilter as ReportStatus)
        : "SEMUA";

    const filteredReports =
      selectedStatus === "SEMUA"
        ? reports
        : reports.filter((item) => item.status === selectedStatus);

    const totalReports = filteredReports.length;
    const uniqueReporterIds = new Set(filteredReports.map((item) => item.userId));
    const totalUniqueReporters = uniqueReporterIds.size;

    const totalWaiting = filteredReports.filter(
      (item) => item.status === "MENUNGGU"
    ).length;
    const totalApproved = filteredReports.filter(
      (item) => item.status === "DISETUJUI"
    ).length;
    const totalRejected = filteredReports.filter(
      (item) => item.status === "DITOLAK"
    ).length;
    const totalProcessed = filteredReports.filter(
      (item) => item.status === "DIPROSES"
    ).length;
    const totalFinished = filteredReports.filter(
      (item) => item.status === "SELESAI"
    ).length;

    const categoryCounts = {
      fasilitasInventaris: filteredReports.filter(
        (item) => item.kategori === "FASILITAS_INVENTARIS"
      ).length,
      itElektronik: filteredReports.filter(
        (item) => item.kategori === "IT_ELEKTRONIK"
      ).length,
      laboratorium: filteredReports.filter(
        (item) => item.kategori === "LABORATORIUM"
      ).length,
    };

    const reporterMap = new Map<
      number,
      {
        userId: number;
        nama: string;
        email: string;
        totalReports: number;
        statuses: ReportStatus[];
        categories: ReportCategory[];
        latestReportAt: string;
      }
    >();

    for (const report of filteredReports) {
      const current = reporterMap.get(report.userId);

      if (!current) {
        reporterMap.set(report.userId, {
          userId: report.user.id,
          nama: report.user.nama,
          email: report.user.email,
          totalReports: 1,
          statuses: [report.status as ReportStatus],
          categories: [report.kategori as ReportCategory],
          latestReportAt: report.createdAt.toISOString(),
        });
      } else {
        current.totalReports += 1;
        current.statuses.push(report.status as ReportStatus);
        current.categories.push(report.kategori as ReportCategory);

        if (new Date(report.createdAt) > new Date(current.latestReportAt)) {
          current.latestReportAt = report.createdAt.toISOString();
        }
      }
    }

    const reporterStats = Array.from(reporterMap.values())
      .map((item) => {
        const categoryCount = item.categories.reduce<Record<string, number>>(
          (acc, category) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          },
          {}
        );

        const sortedCategories = Object.entries(categoryCount).sort(
          (a, b) => b[1] - a[1]
        );

        const topCategoryRaw = sortedCategories[0]?.[0] as
          | ReportCategory
          | undefined;

        const topCategory = topCategoryRaw
          ? getCategoryLabel(topCategoryRaw)
          : "-";

        const lastStatus = item.statuses[0] || "MENUNGGU";

        return {
          userId: item.userId,
          nama: item.nama,
          email: item.email,
          totalReports: item.totalReports,
          lastStatus,
          topCategory,
          latestReportAt: item.latestReportAt,
        };
      })
      .sort((a, b) => {
        if (b.totalReports !== a.totalReports) {
          return b.totalReports - a.totalReports;
        }

        return (
          new Date(b.latestReportAt).getTime() -
          new Date(a.latestReportAt).getTime()
        );
      });

    const topReporter = reporterStats[0] || null;

    return NextResponse.json({
      month: start.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
      monthNumber: month,
      year,
      selectedStatus,
      summary: {
        totalReports,
        totalUniqueReporters,
        totalWaiting,
        totalApproved,
        totalRejected,
        totalProcessed,
        totalFinished,
      },
      categories: {
        items: [
          {
            key: "IT_ELEKTRONIK",
            label: "IT & Elektronik",
            total: categoryCounts.itElektronik,
          },
          {
            key: "FASILITAS_INVENTARIS",
            label: "Fasilitas & Inventaris",
            total: categoryCounts.fasilitasInventaris,
          },
          {
            key: "LABORATORIUM",
            label: "Laboratorium",
            total: categoryCounts.laboratorium,
          },
        ],
      },
      statusBreakdown: [
        {
          key: "DISETUJUI",
          label: "Disetujui",
          total: totalApproved,
        },
        {
          key: "DITOLAK",
          label: "Ditolak",
          total: totalRejected,
        },
        {
          key: "MENUNGGU",
          label: "Menunggu",
          total: totalWaiting,
        },
        {
          key: "DIPROSES",
          label: "Diproses",
          total: totalProcessed,
        },
        {
          key: "SELESAI",
          label: "Selesai",
          total: totalFinished,
        },
      ],
      topReporter,
      reporterStats,
    });
  } catch (error) {
    console.error("MONTHLY_REPORT_STATS_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}