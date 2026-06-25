import { connectDB } from "@/app/lib/db/connectDB";
import { CustomerController } from "@/app/lib/featuers/customer/customer.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await connectDB();
    let body: any = {};
    try {
        body = await req.json();
    } catch (error) {
        // If body is empty or not valid JSON, keep it
        body = {};
    }
    return CustomerController.login(body);
}