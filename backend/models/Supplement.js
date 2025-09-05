import mongoose from "mongoose";
const supplementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { 
      type: String, 
      enum: ["once", "daily", "weekly"], 
      default: "once" 
    },
    times: { type: [String], default: [] },
    notes: { type: String, default: "" },
    category: { type: String, default: "Nutrition" },
    trimester: { type: String, enum: ["1", "2", "3"] },
    intakeHistory: [
      {
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ["taken", "missed"], default: "missed" }
      }
    ]
  },
  { timestamps: true }
);

const Supplement = mongoose.models.Supplement || mongoose.model("Supplement", supplementSchema);

export default Supplement; 
