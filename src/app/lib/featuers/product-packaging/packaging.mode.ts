import { Document, model, models, Schema } from "mongoose";

export interface IPackaging extends Document {
    name: string;
    description?: string;
    type: string; // e.g. Box, Bottle, Pouch
}

const packagingSchema = new Schema<IPackaging>(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        type: {
            type: String,
            required: true
        }
    }, { timestamps: true });

export const Packaging = models.Packaging || model<IPackaging>('Packaging', packagingSchema);
