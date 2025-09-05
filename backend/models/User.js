import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // Optional fields for normal users only
  age: Number,
  phone: String,
  address: String,
  birthStatus: {
    type: String,
    enum: ["first", "second", "third", "fourth_or_more"],
    required: function () { return this.role === "user"; }
  },
  edd: { type: Date, required: function () { return this.role === "user"; } },
  trimester: {
    type: String,
    enum: ["1", "2", "3"],
    required: function () { return this.role === "user"; }
  },
  preWeight: Number,
  currentWeight: Number,
  height: Number,
  allergies: String,
  waterIntake: Number,
  activityLevel: { type: String, enum: ["sedentary", "light", "moderate", "active"] },
  chronicConditions: String,
  pastPregnancyIssues: String,
  supplements: String,
  bloodType: String,
  reminderMethod: { type: String, enum: ["sms", "email"] },

  bmi: Number,
  conditions: [String],
  calorieLimit: Number,
  proteinMin: Number,
  dailyIntake: [
    {
      date: { type: Date, default: Date.now },
      meals: [
        {
          mealId: Number,
          time: String
        }
      ],
      totalCalories: Number,
      totalProtein: Number,
      totalCarbs: Number,
      totalFats: Number,
      totalSodium: Number
    }
  ]

}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
