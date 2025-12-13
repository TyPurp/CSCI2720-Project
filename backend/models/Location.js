// backend/models/Location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  // 基础信息
  name: { type: String, required: true },
  venueId: { type: String, unique: true, required: true },
  address: String,
  district: String,
  
  // 地理位置（地图必需）
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  
  // 关联数据
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  
  // 统计信息
  eventCount: { type: Number, default: 0 },
  
  // 最后更新时间（你负责的部分）
  lastUpdated: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  
  // 系统信息
  source: { type: String, default: 'Cultural Programmes API' }
});

module.exports = mongoose.model('Location', locationSchema);