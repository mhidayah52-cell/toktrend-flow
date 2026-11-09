import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

function isAuthorizedAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("toktrend_session")?.value;
  if (!token) return false;
  const payload = verifySessionToken(token);
  return payload?.role === "ADMIN" || payload?.email === "admin@toktrend.id";
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { error: "Akses ditolak: Hanya Admin yang diizinkan." },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        planTier: true,
        dailySearchUsed: true,
        dailyPromptUsed: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return NextResponse.json({ users: [] });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json(
      { error: "Akses ditolak: Hanya Admin yang diizinkan." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, planTier, resetQuota } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(planTier ? { planTier } : {}),
        ...(resetQuota ? { dailySearchUsed: 0, dailyPromptUsed: 0 } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        planTier: true,
        dailySearchUsed: true,
        dailyPromptUsed: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("Failed to update user:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui data user." },
      { status: 500 }
    );
  }
}
