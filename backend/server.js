import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import twilio from "twilio";

// routes
import authRoutes from "./routes/authRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import userRoutes from "./routes/User.js";
import supplementRoutes from "./routes/SupplementRoutes.js";
import intakeRoutes from "./routes/Intake.js";

// Middleware
import { authMiddleware, authorizeRoles } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Directories-
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, "..", "frontend");
const pagesDir = path.join(frontendDir, "pages");
const uploadDir = path.join(__dirname, "upload", "images");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
// CORS setup
const allowedOrigins = ["http://127.0.0.1:5501"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS not allowed"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
// Global preflight handler
app.options(/.*/, cors(corsOptions));
// Middleware
app.use(express.json());
// Multer for file uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
});
// Static files
app.use("/pages", express.static(pagesDir));
app.use("/uploads", express.static(uploadDir));
app.use("/imgs", express.static("imgs"));
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/reminders", authMiddleware, reminderRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/supplements", authMiddleware, supplementRoutes);
app.use("/api/intake", authMiddleware, intakeRoutes);
// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(pagesDir, "login.html"));
});
// Email & SMS setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export async function sendNotification(reminder, user) {
  const message = `${reminder.title} • ${reminder.category} • ${reminder.datetime.toLocaleString()}\n${reminder.notes || ""}`;

  switch (reminder.channel) {
    case "email":
      if (user.email) await transporter.sendMail({
        from: '"Reminder App" <noreply@reminder.com>',
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        text: message
      });
      break;
    case "sms":
      if (user.phone) await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: user.phone
      });
      break;
    case "push":
      break;
  }
}
app.all(/.*/, (req, res) => res.status(404).json({ message: "Route not found" }));-
// Start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/NutritionTracker", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

startServer();
