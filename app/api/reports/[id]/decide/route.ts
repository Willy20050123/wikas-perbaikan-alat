import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/src/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
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

    const { id } = await ctx.params;
    const reportId = Number(id);

    if (!Number.isInteger(reportId)) {
      return NextResponse.json(
        { message: "ID laporan tidak valid." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const action = String(body.action || "");
    const alasanPenolakan =
      typeof body.alasanPenolakan === "string"
        ? body.alasanPenolakan.trim()
        : "";

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (action === "APPROVE") {
      const updated = await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DISETUJUI",
          alasanPenolakan: null,
          approvedAt: new Date(),
          rejectedAt: null,
        },
      });

      return NextResponse.json({
        message: "Laporan disetujui.",
        report: updated,
      });
    }

    if (action === "REJECT") {
      if (!alasanPenolakan) {
        return NextResponse.json(
          { message: "Alasan penolakan wajib diisi." },
          { status: 400 }
        );
      }

      const updated = await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DITOLAK",
          alasanPenolakan,
          rejectedAt: new Date(),
          approvedAt: null,
        },
      });

      return NextResponse.json({
        message: "Laporan ditolak.",
        report: updated,
      });
    }

    return NextResponse.json(
      { message: "Aksi tidak valid." },
      { status: 400 }
    );
  } catch (error) {
    console.error("DECIDE_REPORT_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}