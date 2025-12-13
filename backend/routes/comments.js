const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Location = require('../models/Location');
const { authenticate } = require('../middleware/auth');

// 1. 添加评论
router.post('/:locationId', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const locationId = req.params.locationId;
    
    // 创建评论
    const comment = new Comment({
      user: req.user.id,
      location: locationId,
      text
    });
    
    await comment.save();
    
    // 更新地点的最后更新时间（你负责的部分）
    await Location.findByIdAndUpdate(locationId, {
      lastUpdated: new Date()
    });
    
    // 获取完整的评论信息（包含用户信息）
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 2. 获取地点的所有评论
router.get('/location/:locationId', authenticate, async (req, res) => {
  try {
    const comments = await Comment.find({ location: req.params.locationId })
      .populate('user', 'username')
      .sort({ createdAt: -1 }); // 最新在前
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// 3. 删除评论（可选，用户只能删自己的）
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // 检查是否是评论所有者或管理员
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;