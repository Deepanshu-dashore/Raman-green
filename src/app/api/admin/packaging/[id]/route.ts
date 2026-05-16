import { PackagingController } from "@/app/lib/featuers/product-packaging/packaging.controller";

export const PATCH = (req: Request, { params }: { params: Promise<{ id: string }> }) => PackagingController.update(req, { params });
export const DELETE = (req: Request, { params }: { params: Promise<{ id: string }> }) => PackagingController.delete(req, { params });
