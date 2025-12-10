// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // 基本信息
  eventId: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // 地点关联（与你的Location模型关联）
  venue: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',  // 引用你的Location模型
    required: true
  },
  
  // 时间信息
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  time: {
    type: String,  // 如 "19:30" 或 "7:30pm"
    trim: true
  },
  duration: {
    type: String,  // 如 "90分钟" 或 "2小时"
    trim: true
  },
  
  // 详情信息（根据文化节目数据集字段）
  description: {
    type: String,
    trim: true
  },
  presenter: {
    type: String,
    required: true,
    trim: true
  },
  organizer: {
    type: String,
    trim: true
  },
  
  // 票务信息
  price: {
    type: String,  // 如 "$100" 或 "免费入场"
    default: 'Free'
  },
  ticketInfo: {
    type: String,
    trim: true
  },
  
  // 限制信息
  ageLimit: {
    type: String,  // 如 "6岁或以上" 或 "适合所有年龄"
    default: 'All ages'
  },
  language: {
    type: String,
    default: 'Cantonese'
  },
  category: {
    type: String,  // 如 "音乐", "戏剧", "舞蹈"
    trim: true
  },
  
  // 用户互动（额外功能）
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  
  // 系统信息
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'Cultural Programmes API'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  // 添加时间戳
  timestamps: true
});

// 自动更新likeCount
eventSchema.pre('save', function(next) {
  this.likeCount = this.likes.length;
  next();
});

// 创建索引以提高查询性能
eventSchema.index({ title: 'text', description: 'text' });  // 全文搜索
eventSchema.index({ location: 1 });                         // 按地点查询
eventSchema.index({ startDate: 1 });                        // 按时间排序
eventSchema.index({ category: 1 });                         // 按类别查询
eventSchema.index({ 'location': 1, 'startDate': 1 });       // 复合索引

// 虚拟字段：判断活动是否已结束
eventSchema.virtual('isPast').get(function() {
  return this.endDate ? this.endDate < new Date() : this.startDate < new Date();
});

// 虚拟字段：格式化日期
eventSchema.virtual('formattedDate').get(function() {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  return this.startDate.toLocaleDateString('en-US', options);
});

// 确保虚拟字段在JSON输出中显示
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);