import jwt, { JwtPayload } from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "auth_token";

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
  email: string;
  role: "ADMIN" | "USER";
};

function isAuthTokenPayload(value: string | JwtPayload): value is AuthTokenPayload {
  if (typeof value === "string") return false;

  return (
    typeof value.userId === "number" &&
    typeof value.nama === "string" &&
    typeof value.email === "string" &&
    (value.role === "ADMIN" || value.role === "USER")
  );
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: "7d",
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