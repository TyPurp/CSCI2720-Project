const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// LocalStorage keys
const LOCAL_LIKES_KEY = 'event_likes_data';

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const msg = `API ${res.status} ${res.statusText} ${text}`;
    throw new Error(msg);
  }
  return res.json();
}

// 获取本地存储的点赞数据
function getLocalLikesData() {
  try {
    const stored = localStorage.getItem(LOCAL_LIKES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.warn('Failed to parse local likes data:', e);
    return {};
  }
}

// 保存点赞数据到本地存储
function saveLocalLikesData(likesData) {
  try {
    localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(likesData));
  } catch (e) {
    console.warn('Failed to save local likes data:', e);
  }
}

// 本地点赞模拟函数 - 修复：返回Promise
function toggleLikeLocal(eventId, username, action) {
  console.log('toggleLikeLocal called:', { eventId, username, action });
  
  try {
    const likesData = getLocalLikesData();
    
    console.log('Current likesData:', likesData);
    
    // 初始化数据结构
    if (!likesData.users) likesData.users = {};
    if (!likesData.events) likesData.events = {};
    
    // 初始化用户数据
    if (!likesData.users[username]) {
      likesData.users[username] = {};
    }
    
    // 初始化事件数据
    if (!likesData.events[eventId]) {
      likesData.events[eventId] = { count: 0, users: [] };
    }
    
    const eventData = likesData.events[eventId];
    const userLiked = likesData.users[username][eventId] || false;
    
    console.log('Before update - userLiked:', userLiked, 'count:', eventData.count);
    
    if (action === 'like' && !userLiked) {
      // 点赞
      likesData.users[username][eventId] = true;
      eventData.count += 1;
      eventData.users.push(username);
      console.log('Liked: added user to event');
    } else if (action === 'unlike' && userLiked) {
      // 取消点赞
      likesData.users[username][eventId] = false;
      eventData.count = Math.max(0, eventData.count - 1);
      eventData.users = eventData.users.filter(u => u !== username);
      console.log('Unliked: removed user from event');
    } else {
      console.log('No change needed - already', action === 'like' ? 'liked' : 'unliked');
    }
    
    console.log('After update - count:', eventData.count);
    
    saveLocalLikesData(likesData);
    console.log('Saved to localStorage:', likesData);
    
    // 返回Promise
    return Promise.resolve({
      success: true,
      action,
      liked: action === 'like',
      likeCount: eventData.count,
      message: 'Using local storage'
    });
  } catch (error) {
    console.error('Error in toggleLikeLocal:', error);
    return Promise.reject(error);
  }
}

// 本地获取用户点赞状态 - 修复：返回Promise
function getUserLikeStatusLocal(eventId, username) {
  console.log('getUserLikeStatusLocal called:', { eventId, username });
  
  try {
    const likesData = getLocalLikesData();
    console.log('Local likes data:', likesData);
    
    const userLiked = likesData.users?.[username]?.[eventId] || false;
    console.log('User liked status:', userLiked);
    
    // 返回Promise
    return Promise.resolve({ liked: userLiked });
  } catch (error) {
    console.error('Error in getUserLikeStatusLocal:', error);
    return Promise.resolve({ liked: false });
  }
}

// 本地获取事件点赞总数 - 修复：返回Promise
function getEventLikesLocal(eventId) {
  console.log('getEventLikesLocal called:', { eventId });
  
  try {
    const likesData = getLocalLikesData();
    console.log('Local likes data:', likesData);
    
    const count = likesData.events?.[eventId]?.count || 0;
    console.log('Event like count:', count);
    
    // 返回Promise
    return Promise.resolve({ count });
  } catch (error) {
    console.error('Error in getEventLikesLocal:', error);
    return Promise.resolve({ count: 0 });
  }
}

export async function fetchVenues(limit=10, offset=0) {
  const url = `${API}/api/venues?limit=${limit}&offset=${offset}`;
  const data = await fetchJSON(url);
  return Array.isArray(data) ? data.map(v => ({ ...v, id: v.venueId ?? v._id ?? v.id })) : data;
}

export async function fetchVenue(venueId) {
  try {
    const res = await fetch(`${API}/api/venues/${venueId}`);
    if (res.ok) {
      const v = await res.json();
      return { ...v, id: v.venueId ?? v._id ?? v.id };
    }
  } catch (_) {}
  const all = await fetchVenues();
  return Array.isArray(all) ? all.find(v => String(v.id) === String(venueId)) : null;
}

export async function fetchEvents(venueId) {
  const url = `${API}/api/events/${venueId}`;
  return fetchJSON(url);
}

export async function fetchComments(venueId) {
  const url = `${API}/api/comments/${venueId}`;
  return fetchJSON(url);
}

export async function postComment(venueId, { username, text }) {
  const url = `${API}/api/comments`;
  const payload = { venueId, username, text };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok ? res.json() : Promise.reject(new Error('Failed to post comment'));
}

export async function getFavourites(username) {
  if (!username) throw new Error('username is required for getFavourites (backend)');
  const url = `${API}/api/favourites/${encodeURIComponent(username)}`;
  const result = await fetchJSON(url);

  const favIds = Array.isArray(result) ? result.map((v) => v.venueId ?? v._id ?? v.id) : [];

  localStorage.setItem('favourites', JSON.stringify(favIds));
  return result;
}

export async function addFavourite(username, venueId) {
  const url = `${API}/api/favourite`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, venueId }),
  });
  const favs = JSON.parse(localStorage.getItem('favourites')) || [];
  if (!favs.includes(venueId)) {
    favs.push(venueId);
    localStorage.setItem('favourites', JSON.stringify(favs));
  }
  return res.ok ? res.json() : Promise.reject(new Error('Failed to add favourite'));
}

export async function removeFavourite(username, venueId) {
  const url = `${API}/api/favourite`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, venueId }),
  });
  const favs = JSON.parse(localStorage.getItem('favourites'));
  localStorage.setItem('favourites', JSON.stringify(favs.filter((id) => id !== venueId)));
  return res.ok ? res.json() : Promise.reject(new Error('Failed to remove favourite'));
}

export async function toggleFavourite(username, locId) {
  const favs = await getFavourites(username)
  
  if (favs.filter(loc => loc.venueId === locId).length > 0) {
    await removeFavourite(username, locId);
    return false;
  } else {
    await addFavourite(username, locId);
    return true;
  }
}

// 修改点赞相关函数，添加LocalStorage后备支持
export async function getEventLikes(eventId) {
  console.log('getEventLikes called for event:', eventId);
  
  try {
    const url = `${API}/api/events/${eventId}/likes`;
    const result = await fetchJSON(url);
    console.log('Using real API for getEventLikes, result:', result);
    return result;
  } catch (err) {
    console.warn('Real API failed for getEventLikes, using local storage:', err.message);
    return getEventLikesLocal(eventId);
  }
}

export async function getUserLikeStatus(eventId, username) {
  console.log('getUserLikeStatus called:', { eventId, username });
  
  if (!username) {
    console.log('No username, returning false');
    return Promise.resolve({ liked: false });
  }
  
  try {
    const url = `${API}/api/events/${eventId}/likes/${username}`;
    const result = await fetchJSON(url);
    console.log('Using real API for getUserLikeStatus, result:', result);
    return result;
  } catch (err) {
    console.warn('Real API failed for getUserLikeStatus, using local storage:', err.message);
    return getUserLikeStatusLocal(eventId, username);
  }
}

export async function toggleLike(eventId, username, action) {
  console.log('toggleLike called:', { eventId, username, action });
  
  try {
    // 先尝试真实API
    const url = `${API}/api/events/${eventId}/like`;
    console.log('Attempting real API call to:', url);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action })
    });
    
    console.log('API response status:', res.status, res.statusText);
    
    if (res.ok) {
      const result = await res.json();
      console.log('Using real API for toggleLike, result:', result);
      return result;
    } else {
      // API返回错误状态
      const errorText = await res.text().catch(() => '');
      console.log('API error response:', errorText);
      throw new Error(`API returned ${res.status} ${res.statusText}: ${errorText}`);
    }
  } catch (err) {
    console.warn('Real API failed for toggleLike, using local storage. Error:', err.message);
    // 使用本地存储
    return toggleLikeLocal(eventId, username, action);
  }
}