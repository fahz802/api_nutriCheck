const express = require('express');
const router = express.Router();
const moment = require('moment');
const verifyToken = require('../middlewares/verifyToken');
const riwayatNutrisi = require('../models/Nutrition');

// Simpan riwayat
router.post('/', verifyToken, async (req, res) => {
  try {
    const { source, food_name, nutrition } = req.body;

    const today = moment().format('YYYY-MM-DD');

    const newEntry = new riwayatNutrisi({
      user_id: req.user.id_users,
      source,
      food_name,
      nutrition,
      date: today
    });

    await newEntry.save();
    res.status(201).json({ message: 'Riwayat disimpan', data: newEntry });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyimpan riwayat', error: error.message });
  }
});

// Ambil semua riwayat
router.get('/', verifyToken, async (req, res) => {
  try {
    const history = await riwayatNutrisi.find({ user_id: req.user.id_users }).sort({ created_at: -1 });
    res.json({ message: 'Data riwayat ditemukan', data: history });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat', error: error.message });
  }
});

module.exports = router;
