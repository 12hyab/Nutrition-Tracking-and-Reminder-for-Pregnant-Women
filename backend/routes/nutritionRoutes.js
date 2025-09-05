import express from "express";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";
import { getNutritionReport } from "../controllers/nutritionController.js";

const router = express.Router();

// GET nutrition report (format=csv)
router.get("/report", authMiddleware, adminOnly, getNutritionReport);
router.get("/users", authMiddleware, authorizeRoles("admin"), async (req, res) => {  });

export default router;
