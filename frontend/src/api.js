// frontend/src/api.js
const API = process.env.REACT_APP_API_BASE_URL || '';

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const msg = `API ${res.status} ${res.statusText} ${text}`;
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchVenues() {
  const url = `${API}/api/venues`;
  const data = await fetchJSON(url);
  // Normalize id for frontend convenience:
  return Array.isArray(data) ? data.map(v => ({ ...v, id: v.venueId ?? v._id ?? v.id })) : data;
}

export async function fetchVenue(venueId) {
  // Try a direct single-venue endpoint first (if present in backend). If not, request all and find.
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

  localStorage.setItem('favourites', JSON.stringify(favIds)); // keep localStorage in sync
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