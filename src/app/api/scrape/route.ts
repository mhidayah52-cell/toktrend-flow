import { NextRequest, NextResponse } from "next/server";
import { analyzeTikTokProductUrl } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body?.url?.trim();

    if (!url || !url.includes("tiktok.com")) {
      return NextResponse.json(
        { error: "Masukkan tautan produk TikTok Shop yang valid (contoh: https://vt.tiktok.com/...)" },
        { status: 400 }
      );
    }

    const analysis = await analyzeTikTokProductUrl(url);
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      { error: "Gagal menganalisis tautan produk TikTok. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
