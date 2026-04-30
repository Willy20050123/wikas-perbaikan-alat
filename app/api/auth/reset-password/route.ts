import { NextResponse } from "next/server";
import { validateMutationRequest } from "@/src/lib/request-security";

export async function POST(req: Request) {
  try {
    const requestError = validateMutationRequest(req, { body: "json" });

    if (requestError) {
      return requestError;
    }

    return NextResponse.json({
      message: "Fitur reset password mandiri tidak tersedia. Hubungi admin.",
    }, { status: 410 });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
