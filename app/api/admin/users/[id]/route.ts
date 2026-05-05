import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getApiSessionUser } from "@/src/lib/session";
import { validateMutationRequest } from "@/src/lib/request-security";

const ACTIVE_REPORT_STATUSES = ["MENUNGGU", "DISETUJUI", "DIPROSES"] as const;

function parseUserId(id: string) {
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

async function requireAdmin() {
  const authUser = await getApiSessionUser();

  if (!authUser) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (authUser.role !== "ADMIN") {
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return { authUser };
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const requestError = validateMutationRequest(req, { body: "json" });

    if (requestError) {
      return requestError;
    }

    const access = await requireAdmin();

    if ("error" in access) {
      return access.error;
    }

    const { id } = await ctx.params;
    const userId = parseUserId(id);

    if (!userId) {
      return NextResponse.json(
        { message: "ID user tidak valid." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    if (targetUser.deletedAt) {
      return NextResponse.json(
        { message: "User sudah dihapus dan tidak bisa diperbarui." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const nama = typeof body.nama === "string" ? body.nama.trim() : "";
    const jabatan =
      typeof body.jabatan === "string" ? body.jabatan.trim() : "";
    const nip = typeof body.nip === "string" ? body.nip.trim() : "";
    const role = body.role === "ADMIN" ? "ADMIN" : "USER";

    if (!nama || !nip) {
      return NextResponse.json(
        { message: "Nama dan NIP wajib diisi." },
        { status: 400 }
      );
    }

    if (nip.length > 50 || nama.length > 120 || jabatan.length > 120) {
      return NextResponse.json(
        { message: "NIP, nama, atau jabatan terlalu panjang." },
        { status: 400 }
      );
    }

    const existingUserByNip = await prisma.user.findUnique({
      where: { activeNip: nip },
      select: {
        id: true,
      },
    });

    if (existingUserByNip && existingUserByNip.id !== userId) {
      return NextResponse.json(
        { message: "NIP sudah digunakan." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        jabatan: jabatan || null,
        nip,
        activeNip: nip,
        role,
      },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        nip: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "User berhasil diperbarui.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE_ADMIN_USER_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const requestError = validateMutationRequest(req);

    if (requestError) {
      return requestError;
    }

    const access = await requireAdmin();

    if ("error" in access) {
      return access.error;
    }

    const { id } = await ctx.params;
    const userId = parseUserId(id);

    if (!userId) {
      return NextResponse.json(
        { message: "ID user tidak valid." },
        { status: 400 }
      );
    }

    if (access.authUser.id === userId) {
      return NextResponse.json(
        { message: "Akun admin yang sedang dipakai tidak bisa dihapus." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        deletedAt: true,
        reports: {
          select: {
            id: true,
            status: true,
            fotoUrl: true,
            completionPhotoUrl: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.deletedAt) {
      return NextResponse.json(
        { message: "User sudah dihapus." },
        { status: 400 }
      );
    }

    const activeReportCount = user.reports.filter((report) =>
      ACTIVE_REPORT_STATUSES.includes(
        report.status as (typeof ACTIVE_REPORT_STATUSES)[number]
      )
    ).length;

    if (activeReportCount > 0) {
      return NextResponse.json(
        {
          message:
            "User tidak bisa dihapus karena masih memiliki laporan aktif. Selesaikan atau tolak laporan aktif terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        activeNip: null,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "User berhasil dihapus. Riwayat laporan tetap tersimpan.",
    });
  } catch (error) {
    console.error("DELETE_ADMIN_USER_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
