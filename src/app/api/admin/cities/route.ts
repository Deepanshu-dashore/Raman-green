import { CityController } from "@/app/lib/featuers/city/city.controller";
import { connectDB } from "@/app/lib/db/connectDB";

export const GET = async (req: Request) => {
  await connectDB();
  return CityController.getAll(req);
};

export const POST = async (req: Request) => {
  await connectDB();
  return CityController.create(req);
};
