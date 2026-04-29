import { createHash } from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET belum diisi di file .env");
  }

  return secret;
}

const AUTH_SECRET = getAuthSecret();

export type AuthTokenPayload = {
  userId: number;
  nama: string;
  role: "ADMIN" | "USER";
  sessionTag: string;
};

function isAuthTokenPayload(value: string | JwtPayload): value is AuthTokenPayload {
  if (typeof value === "string") return false;

  return (
    typeof value.userId === "number" &&
    typeof value.nama === "string" &&
    (value.role === "ADMIN" || value.role === "USER") &&
    typeof value.sessionTag === "string"
  );
}

export function createAuthSessionTag(input: {
  passwordHash: string;
  role: "ADMIN" | "USER";
}) {
  return createHash("sha256")
    .update(`${input.role}:${input.passwordHash}`)
    .digest("hex");
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: `${AUTH_COOKIE_MAX_AGE_SECONDS}s`,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET);

    if (!isAuthTokenPayload(decoded)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}
