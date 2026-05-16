import { UnitController } from "@/app/lib/featuers/product-unit/unit.controller";

export const GET = () => UnitController.getAll();
export const POST = (req: Request) => UnitController.create(req);
