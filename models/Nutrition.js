const mongoose = require('mongoose');

const riwayatNutrisiSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, enum: ['image', 'barcode', 'manual'], required: true },
  food_name: { type: String, required: true },
  nutrition: {
    calories: Number,
    proteins: Number,
    fat: Number,
    carbohydrate: Number
  },
  date: { type: String }, 
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('riwayatNutrisi', riwayatNutrisiSchema);
