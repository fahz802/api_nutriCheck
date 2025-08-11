const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const verifyToken = require('../middlewares/verifyToken');
const csv = require('csv-parser');

const upload = multer({ dest: 'uploads/' });

// ========== 1. Input manual ==========
router.post('/manual', verifyToken, async (req, res) => {
  try {
    const { food_name, nutrition } = req.body;

    if (!food_name || !nutrition) {
      return res.status(400).json({ message: 'Nama makanan dan informasi gizi harus diisi' });
    }

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

    const results = [];
    fs.createReadStream(path.join(__dirname, '../deeplearning/nutrition.csv'))
      .pipe(csv())
      .on('data', (row) => {
        if (row.name && row.name.toLowerCase().includes(food_name.toLowerCase())) {
          results.push({
            name: row.name,
            calories: parseFloat(row.calories),
            proteins: parseFloat(row.proteins),
            fat: parseFloat(row.fat),
            carbohydrate: parseFloat(row.carbohydrate)
          });
        }
      })
      .on('end', () => {
        if (results.length > 0) {
          return res.status(200).json({
            class: food_name,
            confidence: null,
            nutrition: results[0], // ambil yang pertama
            message: 'Data gizi ditemukan'
          });
        } else {
          return res.status(404).json({ message: 'Data gizi tidak ditemukan di dataset' });
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
