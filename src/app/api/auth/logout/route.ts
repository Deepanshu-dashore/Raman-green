import { UserController } from "@/app/lib/featuers/user/user.controller";

export async function POST() {
    return UserController.logout();
}

export async function GET() {
    return UserController.logout();
}
