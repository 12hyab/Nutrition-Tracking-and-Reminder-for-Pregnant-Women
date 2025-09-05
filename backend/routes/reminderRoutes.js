import express from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import Reminder from "../models/Reminder.js";

const router = express.Router();
router.use(authMiddleware);

// Get all reminders for logged-in user
router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id });
    res.json(reminders);
  } catch (err) {
    console.error("Error fetching reminders:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Create a new reminder
router.post("/", async (req, res) => {
  try {
    const allowedFields = ["title", "description", "datetime", "repeat", "status"];
    const reminderData = { user: req.user.id };

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) reminderData[field] = req.body[field];
    });

    const newReminder = await Reminder.create(reminderData);
    res.status(201).json(newReminder);
  } catch (err) {
    console.error("Error creating reminder:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Update a reminder
router.put("/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    if (reminder.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedFields = ["title", "description", "datetime", "repeat", "status"];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) reminder[field] = req.body[field];
    });

    if (req.body.status === "completed" && reminder.repeat) {
      const increment = reminder.repeat === "daily" ? 1 : 7;
      reminder.datetime = new Date(reminder.datetime.getTime() + increment * 24 * 60 * 60 * 1000);
      reminder.status = "pending";
    }

    await reminder.save();
    res.json(reminder);
  } catch (err) {
    console.error("Error updating reminder:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Delete a reminder
router.delete("/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });

    if (reminder.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await reminder.deleteOne();
    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("Error deleting reminder:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Admin-only: get all reminders
router.get("/all", authorizeRoles("admin"), async (req, res) => {
  try {
    const reminders = await Reminder.find().populate("user", "name email");
    res.json(reminders);
  } catch (err) {
    console.error("Error fetching all reminders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
