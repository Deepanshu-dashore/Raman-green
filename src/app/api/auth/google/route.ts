import { connectDB } from "@/app/lib/db/connectDB";
import { CustomerController } from "@/app/lib/featuers/customer/customer.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    return CustomerController.loginGoogle(body);
}
