import { CityController } from "@/app/lib/featuers/city/city.controller";
import { connectDB } from "@/app/lib/db/connectDB";

export const GET = async () => {
  await connectDB();
  return CityController.getUniqueStates();
};
