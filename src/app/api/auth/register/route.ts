import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, verifyOtpToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body?.name || "").trim();
    const email = (body?.email || "").trim().toLowerCase();
    const password = body?.password || "";
    const otpCode = (body?.otpCode || "").trim();
    const otpToken =
      body?.otpToken || request.cookies.get("toktrend_otp_token")?.value || "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (!otpCode) {
      return NextResponse.json(
        {
          error:
            "Kode verifikasi OTP wajib diisi. Klik 'Minta Kode Verifikasi' terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    const otpCheck = verifyOtpToken(otpToken, email, otpCode);
    if (!otpCheck.valid) {
      return NextResponse.json(
        { error: otpCheck.reason || "Kode verifikasi OTP tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    let sessionPayload: {
      id: string;
      email: string;
      name: string;
      role: string;
      planTier: string;
    };

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Email ini sudah terdaftar. Silakan masuk (Login)." },
          { status: 409 }
        );
      }

      const passwordHash = hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          planTier: "FREE",
          dailySearchUsed: 0,
          dailyPromptUsed: 0,
        },
      });

      sessionPayload = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: "USER",
        planTier: newUser.planTier,
      };
    } catch {
      // Serverless Read-Only SQLite Fallback (Stateless Signed Token)
      sessionPayload = {
        id: "cloud-user-" + Date.now(),
        email,
        name,
        role: "USER",
        planTier: "FREE",
      };
    }

    const token = createSessionToken(sessionPayload);
    const response = NextResponse.json({
      user: sessionPayload,
      message: "Akun berhasil dibuat!",
    });

    response.cookies.set("toktrend_session", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat akun." },
      { status: 500 }
    );
  }
}
