import { NextResponse } from "next/server";
export async function POST() {
  try {
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
