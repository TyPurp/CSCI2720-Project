const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  createdAt: { type: Date, default: Date.now }
});

// 确保每个用户只能收藏同一个地点一次
favoriteSchema.index({ user: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);