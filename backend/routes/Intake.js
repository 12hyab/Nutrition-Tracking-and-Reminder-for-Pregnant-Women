import express from "express";
import Intake from "../models/Intake.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
// GET all intake records for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const intake = await Intake.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(intake);
  } catch (err) {
    console.error("Error fetching intake:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST  intake for logged-in user
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { meals, totalCalories, totalProtein, totalCarbs, totalFats, totalSodium, date } = req.body;

    if (!meals || meals.length === 0 || !date) {
      return res.status(400).json({ message: "Meals and date are required" });
    }

    console.log("Authenticated user:", req.user);

    const newIntake = new Intake({
      userId: req.user._id,
      meals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      totalSodium,
      date,
    });

    await newIntake.save();
    res.json({ message: "Intake saved successfully", intake: newIntake });
  } catch (err) {
    console.error("Error saving intake:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;













