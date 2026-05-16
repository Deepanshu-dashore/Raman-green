import { Document, model, models, Schema } from "mongoose";


export interface ICertificate extends Document {
    name: string;
    url: string;
    issueDate?: string;
    validTill?: string;
    issueFor?: string;
    certificateNumber?: string;
    issuedBy?: string;
    description?: string;
}

const certificateSchema = new Schema<ICertificate>(
    {
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        issueDate: { type: String },
        validTill: { type: String },
        issueFor: { type: String },
        certificateNumber: { type: String },
        issuedBy: { type: String },
        description: { type: String }
    }, { timestamps: true });

export const Certificate = models.Certificate || model<ICertificate>('Certificate', certificateSchema);
