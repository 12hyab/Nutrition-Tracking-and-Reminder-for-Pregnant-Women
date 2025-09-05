import { Parser } from "json2csv";
import Nutrition from "../models/Nutrition.js";
import Meal from "../models/Meal.js";
import User from "../models/User.js";

// Nutrition report endpoint with optional CSV export
export async function getNutritionReport(req, res) {
  try {
    const { userId, trimester, startDate, endDate, limit = 50, page = 1, format } = req.query;

    const filter = {};

    if (userId) filter.user = userId;

    // Trimester filter
    if (trimester && userId) {
      const user = await User.findById(userId);
      if (user?.pregnancyStartDate) {
        const { start, end } = getTrimesterDates(user.pregnancyStartDate, parseInt(trimester));
        filter.date = { $gte: start, $lte: end };
      }
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await Nutrition.find(filter)
      .populate("user", "name email")
      .sort({ date: -1 });

    if (format === "csv") {
      const fields = ["user.name", "user.email", "date", "calories", "protein", "carbs", "fats", "source", "referenceId"];
      const parser = new Parser({ fields });
      const csv = parser.parse(records);

      res.header("Content-Type", "text/csv");
      res.attachment("nutrition_report.csv");
      return res.send(csv);
    }

    // Default JSON response with pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedRecords = records.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      count: records.length,
      page: parseInt(page),
      limit: parseInt(limit),
      records: paginatedRecords,
    });
  } catch (err) {
    console.error("Nutrition report error:", err);
    res.status(500).json({ message: "Server error while generating report" });
  }
}
