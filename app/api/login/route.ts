import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createAuthSessionTag,
  getAuthCookieOptions,
  signAuthToken,
} from "@/src/lib/auth";
import { verifyPassword } from "@/src/lib/passwords";
import { getDefaultRedirectForRole } from "@/src/lib/session";
import { findUserByNipRaw } from "@/src/lib/raw-data";
import {
  clearRateLimit,
  getClientIp,
  isRateLimited,
} from "@/src/lib/rate-limit";
import { validateMutationRequest } from "@/src/lib/request-security";

export async function POST(req: Request) {
  try {
    const requestError = validateMutationRequest(req, { body: "json" });

    if (requestError) {
      return requestError;
    }

    const body = await req.json();

    const nip = typeof body.nip === "string" ? body.nip.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!nip || !password) {
      return NextResponse.json(
        { message: "NIP dan password wajib diisi." },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(req);
    const ipLimitKey = `login:ip:${clientIp}`;
    const nipLimitKey = `login:nip:${nip.toLowerCase()}`;

    if (
      isRateLimited(ipLimitKey, { limit: 30, windowMs: 15 * 60 * 1000 }) ||
      isRateLimited(nipLimitKey, { limit: 8, windowMs: 15 * 60 * 1000 })
    ) {
      return NextResponse.json(
        { message: "Terlalu banyak percobaan login. Coba lagi nanti." },
        { status: 429 }
      );
    }

    const user = await findUserByNipRaw(nip, true);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { message: "NIP atau password salah" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { message: "NIP atau password salah" },
        { status: 401 }
      );
    }

    clearRateLimit(nipLimitKey);

    const token = signAuthToken({
      userId: user.id,
      nama: user.nama,
      role: user.role,
      sessionTag: createAuthSessionTag({
        passwordHash: user.passwordHash,
        role: user.role,
      }),
    });

    const response = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        nama: user.nama,
        nip: user.nip,
        role: user.role,
      },
      redirectTo: getDefaultRedirectForRole(user.role),
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server",
        ...(process.env.NODE_ENV !== "production"
          ? {
              detail:
                error instanceof Error ? error.message : String(error),
            }
          : {}),
      },
      { status: 500 }
    );
  }
}
