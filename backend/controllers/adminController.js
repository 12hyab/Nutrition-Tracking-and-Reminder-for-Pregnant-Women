const User = require("../models/User");
const Reminder = require("../models/Reminder");
const Supplement = require("../models/Supplement");

//  Stats / Reports 
exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const reminders = await Reminder.countDocuments();
    const completed = await Reminder.countDocuments({ completed: true });

    res.json({ users, reminders, completed });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const reminders = await Reminder.find();
    const completedReminders = reminders.filter(r => r.completed).length;

    res.json({ usersCount, totalReminders: reminders.length, completedReminders });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports", details: err.message });
  }
};

//  Users 
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password -__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user", details: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};

// Reminders 
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find().populate("user", "fullName email");
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reminders", details: err.message });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const { title, date, user, completed } = req.body;
    if (!title || !date || !user) return res.status(400).json({ error: "Title, date, and user are required" });

    const reminder = new Reminder({ title, date, user, completed: completed || false });
    await reminder.save();
    await reminder.populate("user", "fullName email");
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: "Failed to create reminder", details: err.message });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("user", "fullName email");
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: "Failed to update reminder", details: err.message });
  }
};

//Supplements
exports.getSupplements = async (req, res) => {
  try {
    const supplements = await Supplement.find();
    res.json(supplements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch supplements", details: err.message });
  }
};

exports.addSupplement = async (req, res) => {
  try {
    const supplement = new Supplement(req.body);
    await supplement.save();
    res.status(201).json(supplement);
  } catch (err) {
    res.status(500).json({ error: "Failed to add supplement", details: err.message });
  }
};

exports.updateSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplement) return res.status(404).json({ error: "Supplement not found" });
    res.json(supplement);
  } catch (err) {
    res.status(500).json({ error: "Failed to update supplement", details: err.message });
  }
};

exports.deleteSupplement = async (req, res) => {
  try {
    const supplement = await Supplement.findByIdAndDelete(req.params.id);
    if (!supplement) return res.status(404).json({ error: "Supplement not found" });
    res.json({ message: "Supplement deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete supplement", details: err.message });
  }
};
