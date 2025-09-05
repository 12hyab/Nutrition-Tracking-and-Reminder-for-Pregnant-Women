import mongoose from "mongoose";
const settingsSchema = new mongoose.Schema({
  reminderFreq: {
    type: Number,
    default: 1 
  },
  defaultSupplements: {
    type: [String],
    default: []
  },
  alertThreshold: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
