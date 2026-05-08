import { Document, model, models, Schema } from "mongoose";
import { IOrder } from "../order/order.model";

export interface IPayment extends Document {
    order: IOrder['_id'];
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    status: string;
}

const paymentSchema = new Schema<IPayment>({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    }
}, { timestamps: true });

export const Payment = models.Payment || model<IPayment>('Payment', paymentSchema);