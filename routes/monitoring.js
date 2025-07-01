const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const NutritionLimit = require('../models/NutritionLimit');
const NutritionHistory = require('../models/Nutrition');

// Simpan atau Update batasan nutrisi (create or upsert)
router.post('/limit', verifyToken, async (req, res) => {
  try {
    const { calories, proteins, fat, carbohydrate } = req.body;

    const limit = await NutritionLimit.findOneAndUpdate(
      { user_id: req.user.id_users },
      { calories, proteins, fat, carbohydrate },
      { upsert: true, new: true }
    );

    res.json({ message: 'Batas nutrisi disimpan', data: limit });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyimpan batasan', error: error.message });
  }
});

// Edit limit (PUT)
router.put('/limit', verifyToken, async (req, res) => {
  try {
    const updated = await NutritionLimit.findOneAndUpdate(
      { user_id: req.user.id_users },
      { ...req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Data batasan tidak ditemukan' });
    }

    res.json({ message: 'Batasan nutrisi berhasil diupdate', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update batasan', error: error.message });
  }
});

// Hapus limit (DELETE)
router.delete('/limit', verifyToken, async (req, res) => {
  try {
    const deleted = await NutritionLimit.findOneAndDelete({ user_id: req.user.id_users });

    if (!deleted) {
      return res.status(404).json({ message: 'Batasan tidak ditemukan untuk user ini' });
    }

    res.json({ message: 'Batasan nutrisi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus batasan', error: error.message });
  }
});

// Ambil status konsumsi hari ini vs batasan
router.get('/status', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const historyToday = await NutritionHistory.find({
      user_id: req.user.id_users,
      date: today
    });

    const total = { calories: 0, proteins: 0, fat: 0, carbohydrate: 0 };

    historyToday.forEach(item => {
      if (item.nutrition) {
        total.calories += item.nutrition.calories || 0;
        total.proteins += item.nutrition.proteins || 0;
        total.fat += item.nutrition.fat || 0;
        total.carbohydrate += item.nutrition.carbohydrate || 0;
      }
    });

    const limit = await NutritionLimit.findOne({ user_id: req.user.id_users });

    res.json({
      date: today,
      limit,
      total,
      message: 'Status nutrisi harian berhasil diambil'
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data', error: error.message });
  }
});

module.exports = router;
