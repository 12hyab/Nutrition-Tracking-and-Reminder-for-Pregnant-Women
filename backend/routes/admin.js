import express from "express";
import User from "../models/User.js";
import Intake from "../models/Intake.js";
import Report from "../models/Report.js";
import Settings from "../models/Settings.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const formatIntake = (intakeArray) =>
  intakeArray.map(({ user, date, calories, protein, carbs, fats }) => ({
    userName: user?.name || "Unknown",
    userEmail: user?.email || "",
    date,
    calories,
    protein,
    carbs,
    fats,
  }));

// System Settings
router.get("/settings", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const settings = await Settings.findOne({});
    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  } catch (err) {
    console.error("Error fetching system settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/settings", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { reminderFreq, defaultSupplements, alertThreshold } = req.body;
    const updated = await Settings.findOneAndUpdate(
      {},
      { reminderFreq, defaultSupplements, alertThreshold },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Error updating system settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Users
router.get("/users", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const users = await User.find({}, "name email role status")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/count", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error counting users:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Intake (nutrition logs)
router.get("/intake", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        end.setHours(23, 59, 59, 999); 
        filter.date = { $gte: start, $lte: end };
      }
    }

    const intake = await Intake.find(filter)
      .populate("user", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(formatIntake(intake));
  } catch (err) {
    console.error("Error fetching intake logs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/intake/all", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const intake = await Intake.find().populate("user", "name email");
    res.json(formatIntake(intake));
  } catch (err) {
    console.error("Error exporting all intake logs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/intake/count", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const filter = {};

    if (userId) filter.user = userId;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
      }
    }

    const count = await Intake.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    console.error("Error counting intake logs:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Reports
router.get("/reports", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const reports = await Report.find()
      .populate("user", "name email")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/reports/count", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const count = await Report.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error counting reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
