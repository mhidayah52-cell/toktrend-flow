import { NextRequest, NextResponse } from "next/server";
import { INITIAL_PRODUCTS } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = (searchParams.get("keyword") || "").toLowerCase();
  const category = searchParams.get("category") || "ALL";
  const minCommission = parseFloat(searchParams.get("minCommission") || "0");
  const sortBy = searchParams.get("sortBy") || "growth";

  const filtered = INITIAL_PRODUCTS.filter((p) => {
    const matchKeyword =
      p.title.toLowerCase().includes(keyword) ||
      p.shopName.toLowerCase().includes(keyword);
    const matchCat = category === "ALL" || p.category === category;
    const matchComm = p.commissionRate >= minCommission;
    return matchKeyword && matchCat && matchComm;
  });

  filtered.sort((a, b) => {
    if (sortBy === "growth") return b.growth7d - a.growth7d;
    if (sortBy === "sold") return b.sold7d - a.sold7d;
    if (sortBy === "gmv") return b.gmv7d - a.gmv7d;
    if (sortBy === "commission") return b.commissionAmount - a.commissionAmount;
    return 0;
  });

  return NextResponse.json({
    lastSyncedAt: new Date().toISOString(),
    total: filtered.length,
    products: filtered,
  });
}
