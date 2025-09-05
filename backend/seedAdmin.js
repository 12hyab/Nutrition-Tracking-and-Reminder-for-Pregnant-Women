import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/NutritionTracker";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: "admin@hospital.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      return process.exit(0);
    }

    const admin = new User({
      fullName: "Hospital Admin",
      email: "admin@hospital.com",
      password: "admin1111", 
      role: "admin"
    });

    await admin.save();
    console.log("Admin created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
