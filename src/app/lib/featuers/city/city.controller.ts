import { NextResponse } from "next/server";
import { CityService } from "./city.service";

export class CityController {
    static async getAll(req?: Request) {
        try {
            const filter: any = {};
            if (req) {
                const { searchParams } = new URL(req.url);
                const state = searchParams.get("state");
                if (state) {
                    filter.state = state;
                }
            }
            const data = await CityService.getAll(filter);
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async getUniqueStates() {
        try {
            const data = await CityService.getUniqueStates();
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }

    static async create(req: Request) {
        try {
            const body = await req.json();
            const data = await CityService.create(body);
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async update(req: Request, { params }: { params: Promise<{ id: string }> }) {
        try {
            const body = await req.json();
            const { id } = await params;
            const data = await CityService.update(id, body);
            if (!data) return NextResponse.json({ success: false, message: "City not found" }, { status: 404 });
            return NextResponse.json({ success: true, data });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }

    static async delete(req: Request, { params }: { params: Promise<{ id: string }> }) {
        try {
            const { id } = await params;
            const data = await CityService.delete(id);
            if (!data) return NextResponse.json({ success: false, message: "City not found" }, { status: 404 });
            return NextResponse.json({ success: true, message: "Deleted successfully" });
        } catch (error: any) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }
    }
}
