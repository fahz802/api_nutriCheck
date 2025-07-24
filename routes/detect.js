const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const verifyToken = require('../middlewares/verifyToken');

const upload = multer({ dest: 'uploads/' });

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
