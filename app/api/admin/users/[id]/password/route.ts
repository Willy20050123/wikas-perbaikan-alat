import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getApiSessionUser } from "@/src/lib/session";
import {
  generateRandomPassword,
  hashPassword,
  validatePasswordStrength,
} from "@/src/lib/passwords";

function parseUserId(id: string) {
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getApiSessionUser();

    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const userId = parseUserId(id);

    if (!userId) {
      return NextResponse.json(
        { message: "ID user tidak valid." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const password =
      typeof body.password === "string" && body.password.trim()
        ? body.password.trim()
        : generateRandomPassword();

    const passwordErrors = validatePasswordStrength(password);

    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { message: passwordErrors[0] },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await hashPassword(password),
      },
      select: {
        id: true,
        nama: true,
        nip: true,
      },
    });

    return NextResponse.json({
      message: "Password user berhasil direset.",
      user: updatedUser,
      generatedPassword: password,
    });
  } catch (error) {
    console.error("RESET_ADMIN_USER_PASSWORD_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
