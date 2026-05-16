import { NextResponse } from "next/server";
import { PackagingService } from "./packaging.service";

export class PackagingController {
    static async getAll() {
        try {
            const data = await PackagingService.getAll();
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async create(req: Request) {
        try {
            const body = await req.json();
            const data = await PackagingService.create(body);
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async update(req: Request, { params }: { params: { id: string } }) {
        try {
            const body = await req.json();
            const { id } = params;
            const data = await PackagingService.update(id, body);
            if (!data) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async delete(req: Request, { params }: { params: { id: string } }) {
        try {
            const { id } = params;
            const data = await PackagingService.delete(id);
            if (!data) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
            return NextResponse.json({ success: true, message: "Deleted successfully" });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }
}
