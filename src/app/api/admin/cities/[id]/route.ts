import { CityController } from "@/app/lib/featuers/city/city.controller";

export const PATCH = (req: Request, { params }: { params: Promise<{ id: string }> }) => CityController.update(req, { params });
export const DELETE = (req: Request, { params }: { params: Promise<{ id: string }> }) => CityController.delete(req, { params });
