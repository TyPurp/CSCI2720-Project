const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { authenticate } = require('../middleware/auth');

// 1. 添加到收藏
router.post('/:locationId', authenticate, async (req, res) => {
  try {
    const favorite = new Favorite({
      user: req.user.id,
      location: req.params.locationId
    });
    
    await favorite.save();
    
    // 获取收藏的完整信息
    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate('location', 'name lat lng address');
    
    res.status(201).json(populatedFavorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already in favorites' });
    }
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// 2. 获取用户的所有收藏
router.get('/my-favorites', authenticate, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('location', 'name lat lng address eventCount');
    
    res.json(favorites.map(f => f.location));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// 3. 从收藏中移除
router.delete('/:locationId', authenticate, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      user: req.user.id,
      location: req.params.locationId
    });
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// 4. 检查是否已收藏
router.get('/check/:locationId', authenticate, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user.id,
      location: req.params.locationId
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

module.exports = router;