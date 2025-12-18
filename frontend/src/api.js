/*
CSCI2720 Project:
Members:
Chow Ho Yee (1155214324)
Ho Chi Tung (1155213294)
Lam Tsz Yi (1155212543)
 */

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

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

function getLocalLikesData() {
  try {
    const stored = localStorage.getItem(LOCAL_LIKES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalLikesData(likesData) {
  try {
    localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(likesData));
  } catch (e) {}
}

function toggleLikeLocal(eventId, username, action) {
  try {
    const likesData = getLocalLikesData();
    
    if (!likesData.users) likesData.users = {};
    if (!likesData.events) likesData.events = {};
    
    if (!likesData.users[username]) {
      likesData.users[username] = {};
    }
    
    if (!likesData.events[eventId]) {
      likesData.events[eventId] = { count: 0, users: [] };
    }
    
    const eventData = likesData.events[eventId];
    const userLiked = likesData.users[username][eventId] || false;
    
    if (action === 'like' && !userLiked) {
      likesData.users[username][eventId] = true;
      eventData.count += 1;
      eventData.users.push(username);
    } else if (action === 'unlike' && userLiked) {
      likesData.users[username][eventId] = false;
      eventData.count = Math.max(0, eventData.count - 1);
      eventData.users = eventData.users.filter(u => u !== username);
    }
    
    saveLocalLikesData(likesData);
    
    return Promise.resolve({
      success: true,
      action,
      liked: action === 'like',
      likeCount: eventData.count
    });
  } catch (error) {
    return Promise.reject(error);
  }
}

function getUserLikeStatusLocal(eventId, username) {
  try {
    const likesData = getLocalLikesData();
    const userLiked = likesData.users?.[username]?.[eventId] || false;
    return Promise.resolve({ liked: userLiked });
  } catch (error) {
    return Promise.resolve({ liked: false });
  }
}

function getEventLikesLocal(eventId) {
  try {
    const likesData = getLocalLikesData();
    const count = likesData.events?.[eventId]?.count || 0;
    return Promise.resolve({ count });
  } catch (error) {
    return Promise.resolve({ count: 0 });
  }
}

export function getEventLikesLocalData() {
  try {
    const stored = localStorage.getItem(LOCAL_LIKES_KEY);
    return stored ? JSON.parse(stored) : { users: {}, events: {} };
  } catch (e) {
    return { users: {}, events: {} };
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

export async function getEventLikes(eventId) {
  try {
    const url = `${API}/api/events/${eventId}/likes`;
    const result = await fetchJSON(url);
    return result;
  } catch (err) {
    return getEventLikesLocal(eventId);
  }
}

export async function getUserLikeStatus(eventId, username) {
  if (!username) return Promise.resolve({ liked: false });
  
  try {
    const url = `${API}/api/events/${eventId}/likes/${username}`;
    const result = await fetchJSON(url);
    return result;
  } catch (err) {
    return getUserLikeStatusLocal(eventId, username);
  }
}

export async function toggleLike(eventId, username, action) {
  try {
    const url = `${API}/api/events/${eventId}/like`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action })
    });
    
    if (res.ok) {
      const result = await res.json();
      return result;
    } else {
      throw new Error(`API returned ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    return toggleLikeLocal(eventId, username, action);
  }
}