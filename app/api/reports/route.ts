import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/src/lib/auth";

const VALID_KATEGORI = [
  "FASILITAS_INVENTARIS",
  "IT_ELEKTRONIK",
  "LABORATORIUM",
] as const;

const VALID_SEVERITY = ["RINGAN", "SEDANG", "BERAT"] as const;

type ValidKategori = (typeof VALID_KATEGORI)[number];
type ValidSeverity = (typeof VALID_SEVERITY)[number];

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authUser = verifyAuthToken(token);

    if (!authUser) {
      return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });
    }

    const formData = await req.formData();

    const kategori = String(formData.get("kategori") || "").trim();
    const namaBarang = String(formData.get("namaBarang") || "").trim();
    const lokasi = String(formData.get("lokasi") || "").trim();
    const deskripsi = String(formData.get("deskripsi") || "").trim();
    const severity = String(formData.get("severity") || "").trim();
    const file = formData.get("foto") as File | null;

    if (!kategori || !namaBarang || !lokasi || !deskripsi || !severity) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (!VALID_KATEGORI.includes(kategori as ValidKategori)) {
      return NextResponse.json(
        { message: "Kategori tidak valid." },
        { status: 400 }
      );
    }

    if (!VALID_SEVERITY.includes(severity as ValidSeverity)) {
      return NextResponse.json(
        { message: "Tingkat kerusakan tidak valid." },
        { status: 400 }
      );
    }

    let fotoUrl: string | null = null;

    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeFileName = file.name.replace(/\s+/g, "-").toLowerCase();
      const fileName = `${Date.now()}-${safeFileName}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, buffer);
      fotoUrl = `/uploads/${fileName}`;
    }

    const report = await prisma.report.create({
      data: {
        userId: authUser.userId,
        kategori: kategori as ValidKategori,
        namaBarang,
        lokasi,
        deskripsi,
        severity: severity as ValidSeverity,
        fotoUrl,
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
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authUser = verifyAuthToken(token);

    if (!authUser) {
      return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: authUser.role === "ADMIN" ? {} : { userId: authUser.userId },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("GET_REPORTS_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}