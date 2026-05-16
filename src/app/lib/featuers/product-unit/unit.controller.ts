import { NextResponse } from "next/server";
import { UnitService } from "./unit.service";

export class UnitController {
    static async getAll() {
        try {
            const data = await UnitService.getAll();
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async create(req: Request) {
        try {
            const body = await req.json();
            const data = await UnitService.create(body);
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async update(req: Request, { params }: { params: Promise<{ id: string }> }) {
        try {
            const body = await req.json();
            const { id } = await params;
            const data = await UnitService.update(id, body);
            if (!data) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async delete(req: Request, { params }: { params: Promise<{ id: string }> }) {
        try {
            const { id } = await params;
            const data = await UnitService.delete(id);
            if (!data) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
            return NextResponse.json({ success: true, message: "Deleted successfully" });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }
}
