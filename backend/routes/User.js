import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Settings from "../models/Settings.js"; 
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleware.js";


const router = express.Router();
// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ msg: "Full name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      msg: "Registration successful",
      user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role },
      token
    });
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
// GET CURRENT USER PROFILE
router.get("/profile", authMiddleware, (req, res) => {
  res.json(req.user);
});
// GET ALL USERS (ADMIN ONLY)
router.get("/all-users",  authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.json(users);
  } catch (err) {
    console.error("Error in /all-users:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
// SYSTEM SETTINGS (ADMIN ONLY)
router.get("/settings",  authorizeRoles("admin"), async (req, res) => {
  try {
    const settings = await Settings.findOne({});
    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
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
    console.error("Error updating settings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
