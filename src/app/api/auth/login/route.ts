import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, verifyPassword } from "@/lib/auth";

const OWNER_ADMIN_EMAIL = "admin@toktrend.id";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || "").trim().toLowerCase();
    const password = body?.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    let user: {
      id: string;
      email: string;
      name: string;
      passwordHash: string | null;
      planTier: string;
    } | null = null;

    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch {
      user = null;
    }

    // Cloud/Serverless Fallback for Owner Admin & Demo Creator accounts
    if (!user) {
      if (email === OWNER_ADMIN_EMAIL && password === "admin123") {
        user = {
          id: "admin-owner-1",
          email: OWNER_ADMIN_EMAIL,
          name: "Owner Admin",
          passwordHash: "verified",
          planTier: "PRO",
        };
      } else if (email === "creator@toktrend.id" && password === "password123") {
        user = {
          id: "demo-creator-1",
          email: "creator@toktrend.id",
          name: "Kreator Affiliate ID",
          passwordHash: "verified",
          planTier: "FREE",
        };
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Email atau password tidak sesuai." },
        { status: 401 }
      );
    }

    const isValid =
      user.passwordHash === "verified" ||
      verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email atau password tidak sesuai." },
        { status: 401 }
      );
    }

    const role =
      user.email.toLowerCase() === OWNER_ADMIN_EMAIL ? "ADMIN" : "USER";

    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      planTier: user.planTier,
    };

    const token = createSessionToken(sessionPayload);
    const response = NextResponse.json({
      user: sessionPayload,
      message: "Berhasil masuk!",
    });

    response.cookies.set("toktrend_session", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat proses login." },
      { status: 500 }
    );
  }
}
