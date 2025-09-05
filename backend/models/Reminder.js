import mongoose from "mongoose";
const reminderSchema = new mongoose.Schema(
  {
    supplement: { type: mongoose.Schema.Types.ObjectId, ref: "Supplement", default: null },
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["Nutrition", "Hydration", "Medication", "Appointment", "Exercise"], 
      required: true 
    },
    description: String,
    notes: String,
    datetime: { type: Date, required: true },
    date: Date,
    repeat: { type: String, enum: ["once", "daily", "weekly"], default: "once" },
    channel: { type: String, enum: ["push", "email", "sms"], default: "push" },
    status: { type: String, enum: ["pending", "done", "overdue"], default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } 
  
  },
  { timestamps: true }
);

const Reminder = mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);

export default Reminder; 
