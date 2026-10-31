import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// ⚡ Vercel বিল্ডের সময় .env.local থাকে না, তাই ক্র্যাশ না করে শুধু ওয়ার্নিং দেবে
if (!MONGODB_URI) {
  console.warn("⚠️ MONGODB_URI is missing. Make sure it's set in Vercel Environment Variables.");
}

let cached = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) global.mongoose = cached;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Database connection failed: MONGODB_URI is not defined.");
  }
  
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
