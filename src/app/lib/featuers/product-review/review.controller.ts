import { ReviewService } from "./review.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { verifyJWT } from "../../middlewares/verifyJWT";

export class ReviewController {
    /**
     * Add a review for a product
     * @param productId - ID of the product
     * @param reqData - The review data (rating, review text, attachments)
     */
    static async add(productId: string, reqData: any) {
        try {
            const user = await verifyJWT();
            if (!user) {
                return ApiResponse(401, null, "Unauthorized. Please login to add a review.");
            }

            const review = await ReviewService.addReview(productId, user.id!, reqData);
            return ApiResponse(201, review, "Review added successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    /**
     * Get all reviews for a product
     * @param productId - ID or slug of the product
     */
    static async getReviews(productId: string) {
        try {
            const reviews = await ReviewService.getReviewsByProduct(productId);
            return ApiResponse(200, reviews, "Reviews fetched successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }

    /**
     * Delete a review
     * @param reviewId - ID of the review to delete
     */
    static async delete(reviewId: string) {
        try {
            const user = await verifyJWT();
            if (!user) {
                return ApiResponse(401, null, "Unauthorized. Please login.");
            }

            const deletedReview = await ReviewService.deleteReview(reviewId, user.id!, user.role);
            return ApiResponse(200, deletedReview, "Review deleted successfully.");
        } catch (error: any) {
            return ApiResponse(500, null, error.message);
        }
    }
}
