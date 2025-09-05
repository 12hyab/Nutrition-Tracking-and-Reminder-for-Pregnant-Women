import express from "express";
import { authMiddleware, authorizeRoles } from "./middleware/authMiddleware.js";

const router = express.Router();

// any logged-in user
router.get("/test-auth", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

//  admin only
router.get("/test-admin", authMiddleware, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "You are an admin!", user: req.user });
});

export default router;
