import express from "express";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";
import Supplement from "../models/Supplement.js";

const router = express.Router();
// User routes
router.get("/", authMiddleware, async (req, res) => {
  try {
    const supplements = await Supplement.find({ user: req.user._id });
    res.json(supplements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const newSupplement = await Supplement.create({ ...req.body, user: req.user._id });
    res.status(201).json(newSupplement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Admin route
router.get("/users", authMiddleware, authorizeRoles("admin"), async (req, res) => 
 {
  try {
    const supplements = await Supplement.find().populate("user", "name email");
    res.json(supplements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
