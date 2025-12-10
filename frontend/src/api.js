const API = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchComments(locationId) {
  const res = await fetch(`${API}/locations/${locationId}/comments`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function postComment(locationId, { username, text }) {
  const res = await fetch(`${API}/locations/${locationId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, text }),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

export async function getFavourites() {
  const res = await fetch(`${API}/favourites`);
  if (!res.ok) throw new Error('Failed to fetch favourites');
  return res.json();
}

export async function toggleFavourite(locationId) {
  // Example: backend toggles or use POST/DELETE as your API requires
  const res = await fetch(`${API}/favourites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locationId }),
  });
  if (!res.ok) throw new Error('Failed to update favourite');
  return res.json();
}