const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const NutritionHistory = require('../models/Nutrition');

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id_users;

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);

    const histories = await NutritionHistory.find({
      user_id: userId,
      date: { $gte: start.toISOString().slice(0, 10) }
    });

    const weeklyMap = {};

    histories.forEach(item => {
      const date = new Date(item.date);
      const day = dayNames[date.getDay()];

      if (!weeklyMap[day]) {
        weeklyMap[day] = { day, calories: 0, proteins: 0, fat: 0, carbohydrate: 0 };
      }

      if (item.nutrition) {
        weeklyMap[day].calories += item.nutrition.calories || 0;
        weeklyMap[day].proteins += item.nutrition.proteins || 0;
        weeklyMap[day].fat += item.nutrition.fat || 0;
        weeklyMap[day].carbohydrate += item.nutrition.carbohydrate || 0;
      }
    });

    const weeklyDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const weekly = weeklyDays.map(day => weeklyMap[day] || {
      day,
      calories: 0,
      proteins: 0,
      fat: 0,
      carbohydrate: 0
    });

    const latest = await NutritionHistory.find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(3);

    const riwayat = latest.map(item => ({
      food_name: item.food_name,
      source: item.source,
      date: item.created_at
    }));

    res.json({
      weekly,
      riwayat
    });

  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat data home', error: error.message });
  }
});

module.exports = router;
