// backend/routes/api.js
const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// 获取API状态和最后更新时间
router.get('/status', async (req, res) => {
  try {
    // 获取最新的地点更新时间
    const latestLocation = await Location.findOne()
      .sort({ lastUpdated: -1 })
      .select('lastUpdated');
    
    // 获取统计数据
    const locationCount = await Location.countDocuments();
    const eventCount = await Location.aggregate([
      { $unwind: '$events' },
      { $count: 'total' }
    ]);
    
    res.json({
      status: 'online',
      lastUpdated: latestLocation ? latestLocation.lastUpdated : new Date(),
      statistics: {
        locations: locationCount,
        events: eventCount[0]?.total || 0
      },
      serverTime: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to get API status' 
    });
  }
});

// 更新所有地点的最后更新时间（管理员用）
router.post('/update-all-timestamps', async (req, res) => {
  try {
    const result = await Location.updateMany(
      {},
      { $set: { lastUpdated: new Date() } }
    );
    
    res.json({
      message: 'All timestamps updated',
      updatedCount: result.modifiedCount,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update timestamps' });
  }
});

module.exports = router;