import { PackagingController } from "@/app/lib/featuers/product-packaging/packaging.controller";

export const GET = () => PackagingController.getAll();
export const POST = (req: Request) => PackagingController.create(req);
