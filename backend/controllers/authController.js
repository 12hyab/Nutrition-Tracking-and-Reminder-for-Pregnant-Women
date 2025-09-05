const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Register
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, age, phone, address,
      birthStatus, edd, trimester, preWeight, currentWeight, height,
      allergies, waterIntake, activityLevel,
      chronicConditions, pastPregnancyIssues, supplements, bloodType,
      reminderMethod, role 
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    user = new User({
      name, email, password: hashedPassword, age, phone, address,
      birthStatus, edd, trimester, preWeight, currentWeight, height,
      allergies, waterIntake, activityLevel,
      chronicConditions, pastPregnancyIssues, supplements, bloodType,
      reminderMethod, role: role || "user" // default to "user" if role not provided
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", { email });

    const user = await User.findOne({ email });
    console.log("User from DB:", user);

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, 
        age: user.age,
        phone: user.phone,
        reminderMethod: user.reminderMethod
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};
