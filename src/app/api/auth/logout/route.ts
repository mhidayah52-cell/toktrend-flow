import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Berhasil keluar (Logout)." });
  response.cookies.set("toktrend_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
