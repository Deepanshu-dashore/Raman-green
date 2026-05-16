import { CertificateController } from "@/app/lib/featuers/product-certificate/certifcated.controller";

export const GET = async () => {
    return await CertificateController.getAll();
};

export const POST = async (req: Request) => {
    return await CertificateController.create(req);
};
