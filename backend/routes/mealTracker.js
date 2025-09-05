import Nutrition from "../models/Nutrition.js";
import Meal from "../models/Meal.js";
import User from "../models/User.js";
import cors from 'cors';
app.use(cors({
  origin: 'http://127.0.0.1:5501', 
  credentials: true
}));

export async function saveMealAndNutrition({ user, name, calories, protein, carbs, fats, date }) {
  const meal = await Meal.create({ user, name, calories, protein, carbs, fats, date });

  await Nutrition.create({
    user: meal.user,
    date: meal.date,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fats: meal.fats,
    source: "meal",
    referenceId: meal._id
  });

  return meal;
}
//  get trimester dates
function getTrimesterDates(pregnancyStart, trimester) {
  const trimesterLength = 13 * 7 * 24 * 60 * 60 * 1000; 
  const start = new Date(pregnancyStart.getTime() + (trimester - 1) * trimesterLength);
  const end = new Date(pregnancyStart.getTime() + trimester * trimesterLength - 1);
  return { start, end };
}

// Nutrition report endpoint
export async function getNutritionReport(req, res) {
  try {
    const { userId, trimester, startDate, endDate } = req.query;

    const filter = {};

    if (userId) filter.user = userId;

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // handle trimester filter
    if (trimester && userId) {
      const user = await User.findById(userId);
      if (user?.pregnancyStartDate) {
        const { start, end } = getTrimesterDates(user.pregnancyStartDate, parseInt(trimester));
        filter.date = { $gte: start, $lte: end };
      }
    }
    const records = await Nutrition.find(filter).populate("user", "name email");

    res.json({ count: records.length, records });
  } catch (err) {
    console.error("Nutrition report error:", err);
    res.status(500).json({ message: "Server error while generating report" });
  }
}
