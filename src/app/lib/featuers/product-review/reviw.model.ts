import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    headline: { type: String, required: true },
    review: { type: String, required: true },
    attatchments: {
        type: [String],
        default: [],
        validate: {
            validator: function (val: string[]) {
                return val.length <= 3;
            },
            message: "Attachments exceed the limit of 3"
        }
    },
});

export const Review = models.Review || model("Review", reviewSchema);