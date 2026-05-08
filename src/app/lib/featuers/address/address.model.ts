import {Schema, model, models, Document} from "mongoose";
import { IUser } from "../user/user.model";

export interface IAddress extends Document {
    user: IUser['_id'];
    fullName: string;
    phone: string;
    address?: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
}

const addressSchema = new Schema<IAddress>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    postalCode: {
        type: String,
        required: true
    },

    isDefault: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

export const Address = models.Address || model<IAddress>('Address', addressSchema);
