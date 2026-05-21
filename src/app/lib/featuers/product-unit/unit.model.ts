import { Document, model, models, Schema } from "mongoose";

export interface IUnit extends Document {
    name: string; // e.g., Gram, Kilogram, Litre, Piece
    shortName: string; // e.g., g, kg, L, pc
}

const unitSchema = new Schema<IUnit>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        shortName: {
            type: String,
            required: true,
            unique: true
        }
    }, { timestamps: true });

const UnitModel = models.Unit || model<IUnit>('Unit', unitSchema);
export const Unit = UnitModel;
export default UnitModel;
