import { UserController } from "@/app/lib/featuers/user/user.controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    return UserController.logout();
}
