import { CustomerController } from "@/app/lib/featuers/customer/customer.controller";
import { verifyJWT } from "@/app/lib/middlewares/verifyJWT";

export async function POST() {
    const userPayload = await verifyJWT();
    return CustomerController.logout(userPayload?.id);
}

export async function GET() {
    const userPayload = await verifyJWT();
    return CustomerController.logout(userPayload?.id);
}
