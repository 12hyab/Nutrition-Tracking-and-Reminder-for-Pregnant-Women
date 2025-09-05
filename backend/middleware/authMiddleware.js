import jwt from "jsonwebtoken";
import User from "../models/User.js";
// Helper to skip preflight requests
const skipPreflight = (fn) => (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  return fn(req, res, next);
};
// Verify JWT and attach user
export const authMiddleware = skipPreflight(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    try {
      user = await User.findById(decoded.id).select("-password");
    } catch (dbErr) {
      console.error("Database error:", dbErr);
      return res.status(500).json({ message: "Server error" });
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});
// Role-based authorization
export const authorizeRoles = (...roles) =>
  skipPreflight((req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - insufficient role" });
    }
    next();
  });
