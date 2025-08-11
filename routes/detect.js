const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const verifyToken = require('../middlewares/verifyToken');
const csv = require('csv-parser');
const stringSimilarity = require('string-similarity');
const RiwayatNutrisi = require('../models/Nutrition');

const upload = multer({ dest: 'uploads/' });

// ========== 1. Input manual ==========
router.post('/manual', verifyToken, async (req, res) => {
  try {
    const { food_name, nutrition } = req.body;
    if (!food_name || !nutrition) {
      return res.status(400).json({ message: 'Nama makanan dan informasi gizi harus diisi' });
    }

    // Simpan ke MongoDB
    await RiwayatNutrisi.create({
      user_id: req.user.id_users,
      source: 'manual',
      food_name,
      nutrition,
      date: new Date().toISOString().split('T')[0] // format YYYY-MM-DD
    });

    return res.status(200).json({
      class: food_name,
      confidence: null,
      nutrition,
      message: 'Berhasil input manual informasi gizi'
    });

  } catch (err) {
    return res.status(500).json({ message: 'Error input manual', detail: err.message });
  }
});

// ========== 2. Cari gizi dari nama makanan ==========
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { food_name } = req.query;
    if (!food_name) {
      return res.status(400).json({ message: 'Nama makanan harus diisi' });
    }

    const normalizeName = (name) => {
      if (!name || typeof name !== 'string') return '';
      return name.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const targetName = normalizeName(food_name);
    const dataRows = [];

    fs.createReadStream(path.join(__dirname, '../deeplearning/nutrition.csv'))
      .pipe(csv())
      .on('data', (row) => {
        dataRows.push({
          name: row.name,
          name_cleaned: normalizeName(row.name),
          calories: parseFloat(row.calories),
          proteins: parseFloat(row.proteins),
          fat: parseFloat(row.fat),
          carbohydrate: parseFloat(row.carbohydrate)
        });
      })
      .on('end', async () => {
        if (dataRows.length === 0) {
          return res.status(404).json({ message: 'Dataset kosong atau tidak terbaca' });
        }

        const candidates = dataRows.map(item => item.name_cleaned);
        const bestMatch = stringSimilarity.findBestMatch(targetName, candidates);

        const cutoff = 0.5; // sama seperti main.py
        if (bestMatch.bestMatch.rating >= cutoff) {
          const matchedName = candidates[bestMatch.bestMatchIndex];
          const matchData = dataRows.find(item => item.name_cleaned === matchedName);

          // Simpan ke MongoDB
          await RiwayatNutrisi.create({
            user_id: req.user.id_users, // sesuai JWT
            source: 'name_search',
            food_name: matchData.name,
            nutrition: {
              calories: matchData.calories,
              proteins: matchData.proteins,
              fat: matchData.fat,
              carbohydrate: matchData.carbohydrate
            },
            date: new Date().toISOString().split('T')[0]
          });

          return res.status(200).json({
            class: matchData.name,
            confidence: `${(bestMatch.bestMatch.rating * 100).toFixed(2)}%`,
            nutrition: {
              name: matchData.name,
              calories: matchData.calories,
              proteins: matchData.proteins,
              fat: matchData.fat,
              carbohydrate: matchData.carbohydrate
            },
            message: 'Data gizi ditemukan dengan fuzzy match'
          });
        } else {
          return res.status(404).json({ message: 'Data gizi tidak ditemukan (kemiripan rendah)' });
        }
      });

  } catch (err) {
    return res.status(500).json({ message: 'Error pencarian gizi', detail: err.message });
  }
});


// ========== Endpoint deteksi gambar (lama) ==========
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imagePath = path.join(__dirname, '..', req.file.path);
  console.log('[DEBUG] Image path:', imagePath);

  const python = spawn('python', ['deeplearning/main.py', imagePath]);

  let result = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    const out = data.toString();
    console.log('[PYTHON STDOUT]', out);
    result += out;
  });

  python.stderr.on('data', (data) => {
    const err = data.toString();
    console.error('[PYTHON STDERR]', err); 
    errorOutput += err;
  });

  python.on('close', (code) => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting image:', err);
    });

    if (code !== 0 || errorOutput) {
      try {
        const errorJson = JSON.parse(errorOutput);
        return res.status(500).json({ message: errorJson.error || 'Python error' });
      } catch (e) {
        return res.status(500).json({ message: 'Python error', detail: errorOutput });
      }
    }

    try {
      const json = JSON.parse(result);
      return res.status(200).json(json);
    } catch (e) {
      return res.status(500).json({ message: 'JSON parse error from Python', detail: e.message });
    }
  });
});

module.exports = router;
