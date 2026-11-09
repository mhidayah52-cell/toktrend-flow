import { NextResponse } from "next/server";
import { INITIAL_SHOPS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    total: INITIAL_SHOPS.length,
    shops: INITIAL_SHOPS,
  });
}
