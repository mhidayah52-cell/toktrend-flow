import { NextRequest, NextResponse } from "next/server";
import { INITIAL_PRODUCTS, ProductItem } from "@/lib/mock-data";
import { FlowStyle, generateFlowPackage } from "@/lib/flow-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId: string = body?.productId || "prod-1";
    const style: FlowStyle = body?.style || "problem_solution";
    const customVisualNote: string | undefined = body?.customVisualNote;
    const customProduct: ProductItem | undefined = body?.customProduct;

    const product =
      customProduct ||
      INITIAL_PRODUCTS.find((p) => p.id === productId) ||
      INITIAL_PRODUCTS[0];

    const result = generateFlowPackage(product, style, customVisualNote);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Gagal men-generate prompt Google Flow." },
      { status: 500 }
    );
  }
}
