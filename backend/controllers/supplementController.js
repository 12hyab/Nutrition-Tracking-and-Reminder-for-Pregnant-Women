const mongoose = require("mongoose");
const Supplement = require("../models/Supplement");
const Reminder = require("../models/Reminder");
const User = require("../models/User");

//Get Supplements 
exports.getSupplements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const filter = { user: req.user.id };
    if (user.trimester) filter.trimester = user.trimester;

    const supplements = await Supplement.find(filter);

    // Ensure times is always an array
    const formattedSupplements = supplements.map(s => ({
      ...s.toObject(),
      times: Array.isArray(s.times) ? s.times : (s.times ? [s.times] : [])
    }));

    res.json(formattedSupplements);
  } catch (err) {
    console.error("Error fetching supplements:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add Supplement + Reminders 
exports.addSupplement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new Error("User not found");

    const { name, dosage = "", repeat = "once", time, notes = "" } = req.body;

    // Ensure times is always an array
    const timesArray = Array.isArray(time) ? time.flat() : (time ? [time] : []);
    if (!name || timesArray.length === 0) throw new Error("Name and at least one time required");

    //  Create supplement
    const supplement = new Supplement({
      user: user._id,
      name,
      dosage,
      frequency: repeat.toLowerCase(),
      times: timesArray,
      notes,
      category: "Nutrition",
      trimester: user.trimester ? String(user.trimester) : undefined
    });
    await supplement.save({ session });

    // Create reminders for each time
    const reminders = await Promise.all(timesArray.map(async (timeStr) => {
      const [hour, minute] = timeStr.split(":");
      const datetime = new Date();
      datetime.setHours(Number(hour), Number(minute), 0, 0);

      const reminder = new Reminder({
        user: user._id,
        title: `Take ${name}`,
        description: `${dosage} ${notes}`.trim(),
        datetime,
        repeat: repeat.toLowerCase(),
        status: "pending",
        category: "Nutrition",
        supplement: supplement._id 
      });

      await reminder.save({ session });
      return reminder;
    }));

    await session.commitTransaction();
    session.endSession();

    // Return both supplement and its reminders
    res.status(201).json({ supplement, reminders });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating supplement/reminder:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


//  Mark Intake 
exports.markIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const supp = await Supplement.findById(id);
    if (!supp) return res.status(404).json({ message: "Supplement not found" });

    supp.intakeHistory.push({ date: new Date(), status });
    await supp.save();

    res.json(supp);
  } catch (err) {
    console.error("Error marking intake:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
