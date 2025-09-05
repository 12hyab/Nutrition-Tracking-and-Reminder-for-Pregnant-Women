import mongoose from "mongoose";
const intakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meals: [
      {
        mealId: { type: Number, required: true },
        time: { type: String, required: true },
      },
    ],
    totalCalories: { type: Number },
    totalProtein: { type: Number },
    totalCarbs: { type: Number },
    totalFats: { type: Number },
    totalSodium: { type: Number },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Intake = mongoose.model("Intake", intakeSchema);
export default Intake;
