import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getApiSessionUser } from "@/src/lib/session";
import {
  deleteUploadedFileByUrl,
  saveImageUpload,
  validateImageUpload,
} from "@/src/lib/uploads";
import { findReportByIdRaw } from "@/src/lib/raw-data";
import {
  enforceJsonBodySize,
  enforceMultipartBodySize,
  requireSameOrigin,
} from "@/src/lib/request-security";

type WorkflowAction =
  | "APPROVE"
  | "REJECT"
  | "START_PROCESS"
  | "COMPLETE";

type WorkflowPayload = {
  action: string;
  alasanPenolakan: string;
  assignedTechnician: string;
  adminNotes: string;
  completionNotes: string;
  completionPhoto: File | null;
};

function parseReportId(id: string) {
  const reportId = Number(id);

  if (!Number.isInteger(reportId) || reportId <= 0) {
    return null;
  }

  return reportId;
}

async function parseWorkflowPayload(req: Request): Promise<WorkflowPayload> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();

    return {
      action: String(body.action || "").trim(),
      alasanPenolakan:
        typeof body.alasanPenolakan === "string"
          ? body.alasanPenolakan.trim()
          : "",
      assignedTechnician:
        typeof body.assignedTechnician === "string"
          ? body.assignedTechnician.trim()
          : "",
      adminNotes:
        typeof body.adminNotes === "string" ? body.adminNotes.trim() : "",
      completionNotes:
        typeof body.completionNotes === "string"
          ? body.completionNotes.trim()
          : "",
      completionPhoto: null,
    };
  }

  const formData = await req.formData();

  return {
    action: String(formData.get("action") || "").trim(),
    alasanPenolakan: String(formData.get("alasanPenolakan") || "").trim(),
    assignedTechnician: String(formData.get("assignedTechnician") || "").trim(),
    adminNotes: String(formData.get("adminNotes") || "").trim(),
    completionNotes: String(formData.get("completionNotes") || "").trim(),
    completionPhoto: (formData.get("completionPhoto") as File | null) || null,
  };
}

function isAction(value: string): value is WorkflowAction {
  return (
    value === "APPROVE" ||
    value === "REJECT" ||
    value === "START_PROCESS" ||
    value === "COMPLETE"
  );
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const originError = requireSameOrigin(req);

    if (originError) {
      return originError;
    }

    const contentType = req.headers.get("content-type") || "";
    const sizeError = contentType.includes("application/json")
      ? enforceJsonBodySize(req)
      : enforceMultipartBodySize(req);

    if (sizeError) {
      return sizeError;
    }

    const authUser = await getApiSessionUser();

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const reportId = parseReportId(id);

    if (!reportId) {
      return NextResponse.json(
        { message: "ID laporan tidak valid." },
        { status: 400 }
      );
    }

    const payload = await parseWorkflowPayload(req);

    if (!isAction(payload.action)) {
      return NextResponse.json(
        { message: "Aksi tidak valid." },
        { status: 400 }
      );
    }

    const report = await findReportByIdRaw(reportId);

    if (!report) {
      return NextResponse.json(
        { message: "Laporan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (payload.adminNotes.length > 2000) {
      return NextResponse.json(
        { message: "Catatan internal maksimal 2000 karakter." },
        { status: 400 }
      );
    }

    if (payload.assignedTechnician.length > 120) {
      return NextResponse.json(
        { message: "Nama penanggung jawab maksimal 120 karakter." },
        { status: 400 }
      );
    }

    if (payload.completionNotes.length > 2000) {
      return NextResponse.json(
        { message: "Catatan penyelesaian maksimal 2000 karakter." },
        { status: 400 }
      );
    }

    const completionPhotoValidation = validateImageUpload(payload.completionPhoto);

    if (completionPhotoValidation) {
      return NextResponse.json(
        { message: completionPhotoValidation },
        { status: 400 }
      );
    }

    if (payload.action === "APPROVE") {
      if (report.status !== "MENUNGGU") {
        return NextResponse.json(
          { message: "Hanya laporan menunggu yang bisa disetujui." },
          { status: 400 }
        );
      }

      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DISETUJUI",
          alasanPenolakan: null,
          approvedAt: new Date(),
          rejectedAt: null,
          adminNotes: payload.adminNotes || report.adminNotes || null,
        },
      });

      const updated = await findReportByIdRaw(reportId);

      return NextResponse.json({
        message: "Laporan disetujui.",
        report: updated,
      });
    }

    if (payload.action === "REJECT") {
      if (report.status !== "MENUNGGU" && report.status !== "DISETUJUI") {
        return NextResponse.json(
          { message: "Status laporan tidak dapat ditolak." },
          { status: 400 }
        );
      }

      if (!payload.alasanPenolakan) {
        return NextResponse.json(
          { message: "Alasan penolakan wajib diisi." },
          { status: 400 }
        );
      }

      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DITOLAK",
          alasanPenolakan: payload.alasanPenolakan,
          rejectedAt: new Date(),
          approvedAt: null,
          assignedTechnician: null,
          processedAt: null,
          finishedAt: null,
          completionNotes: null,
          completionPhotoUrl: null,
          adminNotes: payload.adminNotes || report.adminNotes || null,
        },
      });

      const updated = await findReportByIdRaw(reportId);

      if (report.completionPhotoUrl) {
        await deleteUploadedFileByUrl(report.completionPhotoUrl);
      }

      return NextResponse.json({
        message: "Laporan ditolak.",
        report: updated,
      });
    }

    if (payload.action === "START_PROCESS") {
      if (report.status !== "DISETUJUI") {
        return NextResponse.json(
          { message: "Hanya laporan yang disetujui yang bisa diproses." },
          { status: 400 }
        );
      }

      if (!payload.assignedTechnician) {
        return NextResponse.json(
          { message: "Penanggung jawab perbaikan wajib diisi." },
          { status: 400 }
        );
      }

      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DIPROSES",
          assignedTechnician: payload.assignedTechnician,
          processedAt: report.processedAt || new Date(),
          adminNotes: payload.adminNotes || report.adminNotes || null,
        },
      });

      const updated = await findReportByIdRaw(reportId);

      return NextResponse.json({
        message: "Laporan masuk tahap proses perbaikan.",
        report: updated,
      });
    }

    if (report.status !== "DIPROSES") {
      return NextResponse.json(
        { message: "Hanya laporan yang sedang diproses yang bisa diselesaikan." },
        { status: 400 }
      );
    }

    if (!payload.completionNotes && !payload.completionPhoto) {
      return NextResponse.json(
        {
          message:
            "Isi catatan penyelesaian atau upload foto penyelesaian terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    let completionPhotoUrl = report.completionPhotoUrl;

    if (payload.completionPhoto && payload.completionPhoto.size > 0) {
      completionPhotoUrl = await saveImageUpload(payload.completionPhoto);
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "SELESAI",
        assignedTechnician:
          payload.assignedTechnician || report.assignedTechnician || null,
        adminNotes: payload.adminNotes || report.adminNotes || null,
        completionNotes: payload.completionNotes || report.completionNotes || null,
        completionPhotoUrl,
        finishedAt: new Date(),
      },
    });

    const updated = await findReportByIdRaw(reportId);

    if (
      payload.completionPhoto &&
      report.completionPhotoUrl &&
      report.completionPhotoUrl !== completionPhotoUrl
    ) {
      await deleteUploadedFileByUrl(report.completionPhotoUrl);
    }

    return NextResponse.json({
      message: "Laporan ditandai selesai.",
      report: updated,
    });
  } catch (error) {
    console.error("DECIDE_REPORT_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
