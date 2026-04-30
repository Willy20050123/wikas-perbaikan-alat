import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getApiSessionUser } from "@/src/lib/session";
import {
  parseReportFormData,
  validateReportInput,
  type ValidKategori,
  type ValidSeverity,
} from "@/src/lib/report-validation";
import { saveImageUpload, validateImageUpload } from "@/src/lib/uploads";
import { listReportsRaw } from "@/src/lib/raw-data";
import { validateMutationRequest } from "@/src/lib/request-security";

export async function POST(req: Request) {
  try {
    const requestError = validateMutationRequest(req, { body: "multipart" });

    if (requestError) {
      return requestError;
    }

    const authUser = await getApiSessionUser();

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "USER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const reportInput = parseReportFormData(formData);
    const file = formData.get("foto") as File | null;

    const validationError = validateReportInput(reportInput);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const fileValidationError = validateImageUpload(file);

    if (fileValidationError) {
      return NextResponse.json(
        { message: fileValidationError },
        { status: 400 }
      );
    }

    let fotoUrl: string | null = null;

    if (file && file.size > 0) {
      fotoUrl = await saveImageUpload(file);
    }

    const report = await prisma.report.create({
      data: {
        userId: authUser.id,
        kategori: reportInput.kategori as ValidKategori,
        namaBarang: reportInput.namaBarang,
        lokasi: reportInput.lokasi,
        deskripsi: reportInput.deskripsi,
        severity: reportInput.severity as ValidSeverity,
        fotoUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            jabatan: true,
            nip: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Laporan berhasil dikirim.",
      report,
    });
  } catch (error) {
    console.error("CREATE_REPORT_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authUser = await getApiSessionUser();

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reports = await listReportsRaw(
      authUser.role === "ADMIN" ? undefined : authUser.id
    );

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("GET_REPORTS_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
