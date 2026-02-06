const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // 👇 USE MONGODB instead of MONGO_URI
    const conn = await mongoose.connect(process.env.MONGODB);

    console.log("MongoDB connected");
    console.log("DB Name:", conn.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
