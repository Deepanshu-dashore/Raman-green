import { NextResponse } from "next/server";
import { CertificateService } from "./certficate.service";

export class CertificateController {
    static async getAll() {
        try {
            const certificates = await CertificateService.getAllCertificates();
            return NextResponse.json({ success: true, data: certificates });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async create(req: Request) {
        try {
            const body = await req.json();
            const certificate = await CertificateService.createCertificate(body);
            return NextResponse.json({ success: true, data: certificate });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async update(req: Request, { params }: { params: { id: string } }) {
        try {
            const body = await req.json();
            const { id } = params;
            const certificate = await CertificateService.updateCertificate(id, body);
            if (!certificate) {
                return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: certificate });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async delete(req: Request, { params }: { params: { id: string } }) {
        try {
            const { id } = params;
            const certificate = await CertificateService.deleteCertificate(id);
            if (!certificate) {
                return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 });
            }
            return NextResponse.json({ success: true, message: "Certificate deleted successfully" });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }
}
