import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createAuthSessionTag,
  getAuthCookieOptions,
  signAuthToken,
} from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getApiSessionUser } from "@/src/lib/session";
import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from "@/src/lib/passwords";

export async function POST(req: Request) {
  try {
    const authUser = await getApiSessionUser();

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!authUser.passwordHash) {
      return NextResponse.json(
        { message: "Data akun tidak lengkap." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "Semua field password wajib diisi." },
        { status: 400 }
      );
    }

    const currentPasswordValid = await verifyPassword(
      currentPassword,
      authUser.passwordHash
    );

    if (!currentPasswordValid) {
      return NextResponse.json(
        { message: "Password saat ini salah." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Konfirmasi password baru tidak cocok." },
        { status: 400 }
      );
    }

    const passwordErrors = validatePasswordStrength(newPassword);

    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { message: passwordErrors[0] },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        passwordHash,
      },
      select: {
        id: true,
        nama: true,
        role: true,
        passwordHash: true,
      },
    });

    const response = NextResponse.json({
      message: "Password berhasil diperbarui.",
    });

    response.cookies.set(
      AUTH_COOKIE_NAME,
      signAuthToken({
        userId: updatedUser.id,
        nama: updatedUser.nama,
        role: updatedUser.role,
        sessionTag: createAuthSessionTag({
          passwordHash: updatedUser.passwordHash,
          role: updatedUser.role,
        }),
      }),
      getAuthCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("UPDATE_PASSWORD_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
