import { AddressService } from "./address.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { verifyJWT } from "../../middlewares/verifyJWT";

export class AddressController {
    static async add(reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const address = await AddressService.addAddress(user.id!, reqData);
            return ApiResponse(201, address, "Address added successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async getAll() {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const addresses = await AddressService.getAddresses(user.id!);
            return ApiResponse(200, addresses, "Addresses fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async update(id: string, reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const address = await AddressService.updateAddress(user.id!, id, reqData);
            if (!address) return ApiResponse(404, null, "Address not found.");
            return ApiResponse(200, address, "Address updated successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    static async delete(id: string) {
        try {
            const user = await verifyJWT();
            if (!user) return ApiResponse(401, null, "Unauthorized.");

            const address = await AddressService.deleteAddress(user.id!, id);
            if (!address) return ApiResponse(404, null, "Address not found.");
            return ApiResponse(200, null, "Address deleted successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
