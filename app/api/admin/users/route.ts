import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getApiSessionUser } from "@/src/lib/session";
import {
  hashPassword,
  validatePasswordStrength,
} from "@/src/lib/passwords";
import {
  findUserByNipRaw,
  listUsersWithReportCountRaw,
} from "@/src/lib/raw-data";
import { validateMutationRequest } from "@/src/lib/request-security";

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

export async function GET() {
  try {
    const access = await requireAdmin();

    if ("error" in access) {
      return access.error;
    }

    const users = await listUsersWithReportCountRaw();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET_ADMIN_USERS_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const requestError = validateMutationRequest(req, { body: "json" });

    if (requestError) {
      return requestError;
    }

    const access = await requireAdmin();

    if ("error" in access) {
      return access.error;
    }

    const body = await req.json();
    const nama = typeof body.nama === "string" ? body.nama.trim() : "";
    const jabatan =
      typeof body.jabatan === "string" ? body.jabatan.trim() : "";
    const nip = typeof body.nip === "string" ? body.nip.trim() : "";
    const role = body.role === "ADMIN" ? "ADMIN" : "USER";
    const password = typeof body.password === "string" ? body.password : "";

    if (!nama || !nip || !password) {
      return NextResponse.json(
        { message: "Nama, NIP, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (nip.length > 50 || nama.length > 120 || jabatan.length > 120) {
      return NextResponse.json(
        { message: "NIP, nama, atau jabatan terlalu panjang." },
        { status: 400 }
      );
    }

    const passwordErrors = validatePasswordStrength(password);

    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { message: passwordErrors[0] },
        { status: 400 }
      );
    }

    const existingUserByNip = await findUserByNipRaw(nip);

    if (existingUserByNip) {
      return NextResponse.json(
        { message: "NIP sudah digunakan." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const createdUser = await prisma.user.create({
      data: {
        nama,
        jabatan: jabatan || null,
        nip,
        activeNip: nip,
        passwordHash,
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
      message: "User berhasil dibuat.",
      user: createdUser,
    });
  } catch (error) {
    console.error("CREATE_ADMIN_USER_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
