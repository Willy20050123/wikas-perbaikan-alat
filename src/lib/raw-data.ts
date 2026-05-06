import "server-only";

import type { Prisma } from "../generated/prisma/client";
import { prisma } from "@/src/lib/prisma";

export type SessionUserRow = {
  id: number;
  nama: string;
  jabatan: string | null;
  nip: string | null;
  activeNip: string | null;
  role: "ADMIN" | "USER";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionUserWithPasswordRow = SessionUserRow & {
  passwordHash: string;
};

export type ReportRow = {
  id: number;
  userId: number;
  kategori: "FASILITAS_INVENTARIS" | "IT_ELEKTRONIK" | "LABORATORIUM";
  namaBarang: string;
  lokasi: string;
  deskripsi: string;
  severity: "RINGAN" | "SEDANG" | "BERAT";
  fotoUrl: string | null;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "DIPROSES" | "SELESAI";
  alasanPenolakan: string | null;
  assignedTechnician: string | null;
  adminNotes: string | null;
  completionNotes: string | null;
  completionPhotoUrl: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  processedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    nama: string;
    jabatan: string | null;
    nip: string | null;
  };
};

export type PasswordResetTokenRow = {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

const reportInclude = {
  user: {
    select: {
      id: true,
      nama: true,
      jabatan: true,
      nip: true,
    },
  },
} as const;

type ReportWithUser = Prisma.ReportGetPayload<{
  include: typeof reportInclude;
}>;

function normalizeReportRow(row: ReportWithUser): ReportRow {
  return {
    id: row.id,
    userId: row.userId,
    kategori: row.kategori,
    namaBarang: row.namaBarang,
    lokasi: row.lokasi,
    deskripsi: row.deskripsi,
    severity: row.severity,
    fotoUrl: row.fotoUrl,
    status: row.status,
    alasanPenolakan: row.alasanPenolakan,
    assignedTechnician: row.assignedTechnician,
    adminNotes: row.adminNotes,
    completionNotes: row.completionNotes,
    completionPhotoUrl: row.completionPhotoUrl,
    approvedAt: row.approvedAt,
    rejectedAt: row.rejectedAt,
    processedAt: row.processedAt,
    finishedAt: row.finishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: {
      id: row.user.id,
      nama: row.user.nama,
      jabatan: row.user.jabatan,
      nip: row.user.nip,
    },
  };
}

export function findUserByIdRaw(
  id: number,
  includePassword: true
): Promise<SessionUserWithPasswordRow | null>;
export function findUserByIdRaw(
  id: number,
  includePassword?: false
): Promise<SessionUserRow | null>;
export async function findUserByIdRaw(id: number, includePassword = false) {
  if (includePassword) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        nip: true,
        activeNip: true,
        role: true,
        passwordHash: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      nama: true,
      jabatan: true,
      nip: true,
      activeNip: true,
      role: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function findUserByNipRaw(
  nip: string,
  includePassword: true
): Promise<SessionUserWithPasswordRow | null>;
export function findUserByNipRaw(
  nip: string,
  includePassword?: false
): Promise<SessionUserRow | null>;
export async function findUserByNipRaw(nip: string, includePassword = false) {
  if (includePassword) {
    return prisma.user.findUnique({
      where: { activeNip: nip },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        nip: true,
        activeNip: true,
        role: true,
        passwordHash: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return prisma.user.findUnique({
    where: { activeNip: nip },
    select: {
      id: true,
      nama: true,
      jabatan: true,
      nip: true,
      activeNip: true,
      role: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function listUsersWithReportCountRaw() {
  const [users, activeReportCounts] = await Promise.all([
    prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        nip: true,
        activeNip: true,
        role: true,
        deletedAt: true,
        createdAt: true,
        _count: {
          select: {
            reports: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { nama: "asc" }],
    }),
    prisma.report.groupBy({
      by: ["userId"],
      where: {
        status: {
          in: ["MENUNGGU", "DISETUJUI", "DIPROSES"],
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const activeCountByUserId = new Map(
    activeReportCounts.map((item) => [item.userId, item._count._all])
  );

  return users.map((user) => ({
    ...user,
    _count: {
      ...user._count,
      activeReports: activeCountByUserId.get(user.id) || 0,
    },
  }));
}

export async function listReportsRaw(userId?: number) {
  const rows = await prisma.report.findMany({
    where: userId ? { userId } : undefined,
    include: reportInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return rows.map((row) => normalizeReportRow(row));
}

export async function findReportByIdRaw(id: number) {
  const row = await prisma.report.findUnique({
    where: { id },
    include: reportInclude,
  });

  return row ? normalizeReportRow(row) : null;
}

export async function createPasswordResetTokenRaw(
  userId: number,
  tokenHash: string,
  expiresAt: Date
) {
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

export async function findPasswordResetTokenByHashRaw(tokenHash: string) {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      tokenHash: true,
      expiresAt: true,
      usedAt: true,
      createdAt: true,
    },
  });
}
