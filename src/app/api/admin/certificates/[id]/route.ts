import { CertificateController } from "@/app/lib/featuers/product-certificate/certifcated.controller";

export const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    return await CertificateController.update(req, { params });
};

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    return await CertificateController.delete(req, { params });
};
