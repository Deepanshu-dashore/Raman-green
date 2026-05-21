import mongoose from "mongoose";
import "./index.model";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

export const connectDB = async (): Promise<void> => {
    if (connection.isConnected) {
        return;
    }
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    const connectionString = process.env.MONGODB_URL;
    if(!connectionString){
        throw new Error("MONGODB_URL is not defined");
    }
    try {
        const db = await mongoose.connect(connectionString);
        connection.isConnected = db.connections[0].readyState;
        console.log("Raman-Green-Database connected");
    } catch (error) {
        console.error("Raman-Green-Database connection error:", error);
        throw error;
    }
}