import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OWNER_ADMIN_EMAIL = "admin@toktrend.id";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("toktrend_session")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ user: null });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        planTier: true,
        dailySearchUsed: true,
        dailyPromptUsed: true,
      },
    });
    if (!dbUser) {
      return NextResponse.json({ user: payload });
    }
    const role =
      dbUser.email.toLowerCase() === OWNER_ADMIN_EMAIL ? "ADMIN" : "USER";
    return NextResponse.json({ user: { ...dbUser, role } });
  } catch {
    return NextResponse.json({ user: payload });
  }
}
