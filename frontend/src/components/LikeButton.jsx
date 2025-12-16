import { useState, useEffect } from 'react';
import { getUserLikeStatus, toggleLike } from '../api';
import useAuth from '../hooks/useAuth';

export default function LikeButton({ eventId, initialLikeCount = 0 }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // 获取点赞数的函数
  const getEventLikesCount = async () => {
    try {
      // 使用 api.js 中的函数或直接调用
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/likes`);
      const data = await response.json();
      setLikeCount(data.count || 0);
    } catch (err) {
      console.error('Failed to get likes count:', err);
    }
  };

  useEffect(() => {
    if (user?.username && eventId) {
      // 获取用户点赞状态
      getUserLikeStatus(eventId, user.username)
        .then(data => setLiked(data.liked))
        .catch(console.error);
      
      // 获取总点赞数
      getEventLikesCount();
    }
  }, [eventId, user, getEventLikesCount]); // ✅ 添加 getEventLikesCount 到依赖

  const handleLikeClick = async () => {
    if (!user || !user.username) {
      alert('Please login to like events');
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    const action = liked ? 'unlike' : 'like';
    
    try {
      const result = await toggleLike(eventId, user.username, action);
      setLiked(!liked);
      setLikeCount(result.likeCount);
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLikeClick}
      disabled={loading}
      style={{
        backgroundColor: 'transparent',
        border: '1px solid',
        borderColor: liked ? '#e0245e' : '#657786',
        color: liked ? '#e0245e' : '#657786',
        borderRadius: '20px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s',
        marginLeft: '10px'
      }}
      title={liked ? 'Unlike this event' : 'Like this event'}
    >
      <span style={{ fontSize: '16px' }}>
        {liked ? '❤️' : '🤍'}
      </span>
      <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
        {likeCount > 0 ? likeCount : ''}
      </span>
    </button>
  );
}