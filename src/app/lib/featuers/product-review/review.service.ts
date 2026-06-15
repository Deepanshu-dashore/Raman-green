import { Review } from "./reviw.model";
import { Product } from "../product/product.model";

export class ReviewService {
    /**
     * Add a review for a product
     * @param productId - ID of the product being reviewed
     * @param userId - ID of the user writing the review
     * @param data - Review data containing rating, review text, and attachments
     */
    static async addReview(productId: string, userId: string, data: any) {
        // 1. Verify that the product exists
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found.");
        }

        const { rating, headline, review, attatchments } = data;

        if (!rating || rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5.");
        }

        if (!headline || !headline.trim()) {
            throw new Error("Review headline is required.");
        }

        if (!review || !review.trim()) {
            throw new Error("Review text is required.");
        }

        // 2. Create the review
        const newReview = new Review({
            productId,
            userId,
            rating,
            headline,
            review,
            attatchments: attatchments || []
        });

        await newReview.save();

        // 3. Return the populated review
        const populatedReview = await Review.findById(newReview._id)
            .populate("userId", "name email");

        return populatedReview;
    }

    /**
     * Get all reviews for a product
     * @param productId - ID or slug of the product
     */
    static async getReviewsByProduct(productId: string) {
        // Check if the productId is an ObjectId, if not, find the product by slug first
        let targetProductId = productId;
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            const product = await Product.findOne({ slug: productId });
            if (!product) {
                return [];
            }
            targetProductId = product._id as string;
        }

        const reviews = await Review.find({ productId: targetProductId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        return reviews;
    }

    /**
     * Delete a review
     * @param reviewId - ID of the review to delete
     * @param userId - ID of the requesting user
     * @param userRole - Role of the requesting user
     */
    static async deleteReview(reviewId: string, userId: string, userRole?: string) {
        const reviewObj = await Review.findById(reviewId);
        if (!reviewObj) {
            throw new Error("Review not found.");
        }

        // Check if requesting user is the owner of the review or an admin
        if (reviewObj.userId.toString() !== userId && userRole !== 'admin') {
            throw new Error("Unauthorized to delete this review.");
        }

        await Review.findByIdAndDelete(reviewId);
        return reviewObj;
    }
}
