const express = require('express');
const axios = require('axios');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.get('/:barcode', verifyToken, async (req, res) => {
  const barcode = req.params.barcode;
  const userId = req.user?.id || 'unknown'; 

  console.log(`[INFO] 🧾 Request barcode: ${barcode} oleh user: ${userId}`);

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const response = await axios.get(url);

    if (!response.data || response.data.status !== 1) {
      console.warn(`[WARN] ❌ Barcode ${barcode} tidak ditemukan di Open Food Facts.`);
      return res.status(404).json({ message: 'Produk tidak ditemukan di Open Food Facts' });
    }

    const product = response.data.product;

    console.log(`[SUCCESS] ✅ Produk ditemukan untuk barcode ${barcode}: ${product.product_name}`);

    res.json({
      name: product.product_name || 'Tidak diketahui',
      brand: product.brands,
      image: product.image_front_url,
      nutriments: product.nutriments || {},
      quantity: product.quantity || '',
      serving_size: product.serving_size || '',
    });
  } catch (error) {
    console.error(`[ERROR] Gagal mengambil data dari OFF untuk barcode ${barcode}:`, error.message);
    res.status(500).json({ message: 'Gagal mengambil data dari Open Food Facts' });
  }
});

module.exports = router;
