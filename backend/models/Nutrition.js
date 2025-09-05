// backend/models/Nutrition.js
import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },
  trimester: { type: Number },
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
});

// Create model
const Nutrition = mongoose.model("Nutrition", nutritionSchema);

export default Nutrition;
