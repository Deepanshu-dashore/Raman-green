import { UnitController } from "@/app/lib/featuers/product-unit/unit.controller";
import { connectDB } from "@/app/lib/db/connectDB";
export const GET = async () => {
  await connectDB();
  return UnitController.getAll();
};
export const POST = async (req: Request) => {
  await connectDB();
  return UnitController.create(req);
};

