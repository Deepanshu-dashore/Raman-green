import mongoose, { Mongoose } from "mongoose";
import "./index.model";

const MONGODB_URI = process.env.MONGODB_URL || process.env.DATABASE_URL;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URL or DATABASE_URL environment variable inside .env");
}

type MongooseGlobal = typeof globalThis & {
    mongoose?: {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
    };
};

const globalWithMongoose = global as MongooseGlobal;

if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { conn: null, promise: null };
}
const cached = globalWithMongoose.mongoose;

export async function connectDB(): Promise<Mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        console.log("Connecting to MongoDB...");
        cached.promise = mongoose.connect(MONGODB_URI as string, {
            bufferCommands: false,
        }).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}