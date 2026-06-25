// src/app/api/cart/[productId]/[variant]/route.ts
import { connectDB } from "@/app/lib/db/connectDB";
import { updateItemQuantity } from "@/app/lib/featuers/cart/cart.controller";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Promise<{ productId: string; variant: string }> }) {
  await connectDB();
  const { productId, variant: encodedVariant } = await context.params;
  const variant = JSON.parse(decodeURIComponent(encodedVariant));
  const { quantity } = await req.json();
  // Expect quantity to be the new absolute quantity or diff as needed
  return updateItemQuantity({ productId, variant, quantity });
}
