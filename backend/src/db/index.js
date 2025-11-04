import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000, // Retry for 5s before failing
      socketTimeoutMS: 45000,         // Close idle sockets after 45s
      family: 4,                      // Force IPv4 (Atlas-safe)
      retryWrites: true,
      w: "majority"
    };

    const conn = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      options
    );

    console.log(`✅ MongoDB connected → ${conn.connection.host}`);

    // Connection event handlers (lightweight)
    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️ MongoDB disconnected — attempting to reconnect...")
    );

    mongoose.connection.on("reconnected", () =>
      console.log("🔁 MongoDB reconnected")
    );

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed (app terminated)");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);

    if (error.message.includes("SSL") || error.message.includes("TLS")) {
      console.error("💡 Possible SSL issue: Check Atlas Network Access & IP Whitelist");
    }

    process.exit(1);
  }
};

export default connectDB;
