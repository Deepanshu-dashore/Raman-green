import { Document, Model, model, models, Schema } from "mongoose";

export interface ICity extends Document {
    name: string; // e.g., Indore, Bhopal
    state?: string; // e.g., Madhya Pradesh
}

const citySchema = new Schema<ICity>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        state: {
            type: String,
            default: ""
        }
    }, { timestamps: true });

const CityModel = models.City || model<ICity>('City', citySchema);
export const City = CityModel as Model<ICity>;
export default CityModel as Model<ICity>;
