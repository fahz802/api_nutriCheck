const mongoose = require('mongoose');

const nutritionLimitSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  calories: Number,
  proteins: Number,
  fat: Number,
  carbohydrate: Number
});

module.exports = mongoose.model('NutritionLimit', nutritionLimitSchema);
