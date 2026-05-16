import { Certificate, ICertificate } from "./certifcate.model";

export class CertificateService {
    static async getAllCertificates() {
        return await Certificate.find().sort({ createdAt: -1 });
    }

    static async getCertificateById(id: string) {
        return await Certificate.findById(id);
    }

    static async createCertificate(data: Partial<ICertificate>) {
        const certificate = new Certificate(data);
        return await certificate.save();
    }

    static async updateCertificate(id: string, data: Partial<ICertificate>) {
        return await Certificate.findByIdAndUpdate(id, data, { new: true });
    }

    static async deleteCertificate(id: string) {
        return await Certificate.findByIdAndDelete(id);
    }
}
