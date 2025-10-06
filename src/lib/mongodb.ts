import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    // Disable mongoose buffering before connecting
    mongoose.set('bufferCommands', false);
    
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "socialscheduler",
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err; // Re-throw error so API routes can handle it
  }
};
