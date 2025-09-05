export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admins only" });
  }
  next();
};
