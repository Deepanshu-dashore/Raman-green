import { connectDB } from "@/app/lib/db/connectDB";
import { VariantController } from "@/app/lib/featuers/product-variant/variant.controller";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  await connectDB();
  const { variantId } = await params;
  return VariantController.getById(variantId);
}
