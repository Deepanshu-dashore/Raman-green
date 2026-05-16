import { UnitController } from "@/app/lib/featuers/product-unit/unit.controller";

export const PATCH = (req: Request, { params }: { params: { id: string } }) => UnitController.update(req, { params });
export const DELETE = (req: Request, { params }: { params: { id: string } }) => UnitController.delete(req, { params });
