import { connectDB } from "@/app/lib/db/connectDB";
import { UserController } from "@/app/lib/featuers/user/user.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    await connectDB();
    const body = await req.json();
    return UserController.registerCustomer(body);
}
