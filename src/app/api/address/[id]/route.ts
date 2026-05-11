import { connectDB } from "@/app/lib/db/connectDB";
import { AddressController } from "@/app/lib/featuers/address/address.controller";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    return AddressController.update(id, body);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = await params;
    return AddressController.delete(id);
}
