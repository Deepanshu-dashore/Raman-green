import { connectDB } from "@/app/lib/db/connectDB";
import { AddressController } from "@/app/lib/featuers/address/address.controller";
import { NextRequest } from "next/server";

export async function GET() {
    await connectDB();
    return AddressController.getAll();
}

export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    return AddressController.add(body);
}
