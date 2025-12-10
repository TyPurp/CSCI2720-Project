// backend/routes/locations.js
const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { authenticate } = require('../middleware/auth');

// 1. 获取所有地点（地点列表）
router.get('/', authenticate, async (req, res) => {
  try {
    const locations = await Location.find()
      .populate('events', 'title startDate presenter')
      .select('name lat lng eventCount address district lastUpdated');
    
    // 计算距离（如果提供了用户位置）
    const { userLat, userLng } = req.query;
    if (userLat && userLng) {
      locations.forEach(location => {
        location.distance = calculateDistance(
          parseFloat(userLat), parseFloat(userLng),
          location.lat, location.lng
        );
      });
      
      // 按距离排序
      locations.sort((a, b) => a.distance - b.distance);
    }
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// 2. 获取单个地点详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate({
        path: 'events',
        select: 'title startDate description presenter price'
      })
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username' }
      });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// 3. 搜索和过滤地点
router.get('/search/filter', authenticate, async (req, res) => {
  try {
    const { keyword, district, maxDistance, userLat, userLng } = req.query;
    const query = {};
    
    // 关键词搜索
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    
    // 区域过滤
    if (district) {
      query.district = district;
    }
    
    // 距离过滤
    let locations = await Location.find(query)
      .populate('events')
      .select('name lat lng eventCount address district');
    
    // 计算距离并过滤
    if (userLat && userLng && maxDistance) {
      const userLatNum = parseFloat(userLat);
      const userLngNum = parseFloat(userLng);
      const maxDist = parseFloat(maxDistance);
      
      locations = locations.filter(location => {
        const distance = calculateDistance(
          userLatNum, userLngNum,
          location.lat, location.lng
        );
        location.distance = distance;
        return distance <= maxDist;
      });
      
      // 按距离排序
      locations.sort((a, b) => a.distance - b.distance);
    }
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Filter failed' });
  }
});

// 计算两个坐标之间的距离（公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 返回公里数
}

module.exports = router;