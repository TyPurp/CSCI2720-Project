import './App.css';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in react-leaflet (CRA-compatible)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// MOCK DATA (includes coords, area, description, events)
const MOCK_LOCATIONS = [
  {
    id: 1,
    name: 'Central Park',
    lat: 40.7829,
    lng: -73.9654,
    area: 'Manhattan',
    description: 'Large public park in Manhattan.',
    events: [{ id: 'e1', title: 'Summer Concert' }],
  },
  {
    id: 2,
    name: 'Times Square',
    lat: 40.7580,
    lng: -73.9855,
    area: 'Manhattan',
    description: 'Famous entertainment intersection.',
    events: [{ id: 'e2', title: 'Street Performance' }],
  },
  {
    id: 3,
    name: 'Brooklyn Bridge',
    lat: 40.7061,
    lng: -73.9969,
    area: 'Brooklyn',
    description: 'Historic suspension bridge.',
    events: [{ id: 'e3', title: 'Photography Meetup' }],
  },
  {
    id: 4,
    name: 'Statue of Liberty',
    lat: 40.6892,
    lng: -74.0445,
    area: 'Harbour',
    description: 'Iconic statue on Liberty Island.',
    events: [{ id: 'e4', title: 'Guided Tour' }],
  },
  {
    id: 5,
    name: 'Wall Street',
    lat: 40.7074,
    lng: -74.0113,
    area: 'Manhattan',
    description: 'Financial district.',
    events: [{ id: 'e5', title: 'Market Talk' }],
  },
  {
    id: 6,
    name: 'Empire State Building',
    lat: 40.7484,
    lng: -73.9857,
    area: 'Manhattan',
    description: 'Historic skyscraper.',
    events: [{ id: 'e6', title: 'Observation Deck' }],
  },
  {
    id: 7,
    name: 'Grand Central',
    lat: 40.7527,
    lng: -73.9772,
    area: 'Manhattan',
    description: 'Major transit hub.',
    events: [{ id: 'e7', title: 'Historic Tour' }],
  },
  {
    id: 8,
    name: 'High Line Park',
    lat: 40.7480,
    lng: -74.0048,
    area: 'Manhattan',
    description: 'Elevated linear park.',
    events: [{ id: 'e8', title: 'Art Walk' }],
  },
];

// Haversine distance formula (returns km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Demo user coords
const USER_LAT = 40.758;
const USER_LNG = -73.9855;

function Login() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <p>Placeholder login page.</p>
    </div>
  );
}

function Locations({ filters }) {
  const [sortConfig, setSortConfig] = useState({ field: 'name', order: 'asc' });

  // derive list with computed distance, filtering, and sorting
  const visible = useMemo(() => {
    // compute distance for each location (do not mutate MOCK_LOCATIONS)
    const withDistance = MOCK_LOCATIONS.map((loc) => {
      const dist = calculateDistance(USER_LAT, USER_LNG, loc.lat, loc.lng);
      return { ...loc, distanceKm: dist };
    });

    // apply filters
    let result = withDistance;

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(
        (loc) =>
          (loc.name && loc.name.toLowerCase().includes(kw)) ||
          (loc.description && loc.description.toLowerCase().includes(kw))
      );
    }

    if (filters.area && filters.area !== 'All') {
      result = result.filter((loc) => loc.area === filters.area);
    }

    if (filters.maxDistance !== null && filters.maxDistance !== undefined && filters.maxDistance !== '') {
      const maxD = Number(filters.maxDistance);
      if (!Number.isNaN(maxD)) {
        result = result.filter((loc) => loc.distanceKm <= maxD);
      }
    }

    // apply sorting
    const { field, order } = sortConfig;
    const sorted = [...result].sort((a, b) => {
      let aVal;
      let bVal;
      if (field === 'distance') {
        aVal = a.distanceKm;
        bVal = b.distanceKm;
      } else if (field === 'events') {
        aVal = (a.events || []).length;
        bVal = (b.events || []).length;
      } else {
        aVal = (a[field] || '').toString().toLowerCase();
        bVal = (b[field] || '').toString().toLowerCase();
      }

      if (typeof aVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return sorted;
  }, [filters, sortConfig]);

  const handleSort = (field) => {
    setSortConfig((prev) => {
      const newOrder = prev.field === field && prev.order === 'asc' ? 'desc' : 'asc';
      return { field, order: newOrder };
    });
  };

  const getSortIndicator = (field) => {
    if (sortConfig.field !== field) return ' ↕️';
    return sortConfig.order === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div style={{ padding: 20, textAlign: 'left' }}>
      <h2>Locations</h2>
      <p>{visible.length} result(s). Click headers to sort.</p>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => handleSort('name')}>
              Name {getSortIndicator('name')}
            </th>
            <th style={styles.th} onClick={() => handleSort('distance')}>
              Distance (km) {getSortIndicator('distance')}
            </th>
            <th style={styles.th} onClick={() => handleSort('events')}>
              Events {getSortIndicator('events')}
            </th>
            <th style={styles.th}>Area</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.length ? (
            visible.map((loc) => (
              <tr key={loc.id} style={styles.tr}>
                <td style={styles.td}>{loc.name}</td>
                <td style={styles.td}>{loc.distanceKm.toFixed(1)}</td>
                <td style={styles.td}>{(loc.events || []).length}</td>
                <td style={styles.td}>{loc.area}</td>
                <td style={styles.td}>
                  <Link to={`/locations/${loc.id}`} style={styles.link}>
                    View
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>
                No locations match your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const locId = parseInt(id, 10);
  const location = MOCK_LOCATIONS.find((l) => l.id === locId);

  // favourites from localStorage
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFav(favs.includes(locId));
  }, [locId]);

  const toggleFavourite = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const exists = favs.includes(locId);
    const newFavs = exists ? favs.filter((x) => x !== locId) : [...favs, locId];
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    setIsFav(!exists);
  };

  if (!location) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Location not found</h2>
        <button onClick={() => navigate('/locations')} style={styles.button}>
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{location.name}</h2>
      <p>{location.description}</p>
      <p>
        <strong>Coordinates:</strong> {location.lat}, {location.lng}
      </p>

      <div style={{ height: 300, marginBottom: 12 }}>
        <MapContainer center={[location.lat, location.lng]} zoom={14} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[location.lat, location.lng]} />
        </MapContainer>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={toggleFavourite} style={{ ...styles.button, marginRight: 8 }}>
          {isFav ? 'Remove Favourite' : 'Add Favourite'}
        </button>
        <Link to="/locations" style={{ ...styles.link, marginLeft: 8 }}>
          Back to locations
        </Link>
      </div>

      <section style={{ marginTop: 16 }}>
        <h3>Events</h3>
        {(location.events || []).length ? (
          <ul>
            {location.events.map((e) => (
              <li key={e.id}>{e.title}</li>
            ))}
          </ul>
        ) : (
          <p>No events listed.</p>
        )}
      </section>

      <CommentsSection locationId={locId} />
    </div>
  );
}

function CommentsSection({ locationId }) {
  const storageKey = `comments_${locationId}`;
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        setComments(JSON.parse(raw));
      } catch {
        setComments([]);
      }
    }
  }, [storageKey]);

  const submit = (e) => {
    e.preventDefault();
    if (!username.trim() || !text.trim()) return;
    const newComment = {
      id: Date.now(),
      username: username.trim(),
      text: text.trim(),
      time: new Date().toISOString(),
    };
    const next = [newComment, ...comments];
    setComments(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setText('');
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h3>Comments</h3>
      <form onSubmit={submit} style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 6, width: 200, marginRight: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{ padding: 6, width: '100%', maxWidth: 600 }}
          />
        </div>
        <button type="submit" style={styles.button}>
          Post Comment
        </button>
      </form>

      <div>
        {comments.length ? (
          comments.map((c) => (
            <div key={c.id} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
              <div style={{ fontWeight: 'bold' }}>{c.username}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{new Date(c.time).toLocaleString()}</div>
              <div style={{ marginTop: 6 }}>{c.text}</div>
            </div>
          ))
        ) : (
          <p>No comments yet — be the first!</p>
        )}
      </div>
    </section>
  );
}

function MapView({ filters }) {
  const navigate = useNavigate();

  const visible = useMemo(() => {
    const withDistance = MOCK_LOCATIONS.map((loc) => ({
      ...loc,
      distanceKm: calculateDistance(USER_LAT, USER_LNG, loc.lat, loc.lng),
    }));

    // filters same as Locations
    let res = withDistance;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      res = res.filter(
        (loc) =>
          (loc.name && loc.name.toLowerCase().includes(kw)) ||
          (loc.description && loc.description.toLowerCase().includes(kw))
      );
    }
    if (filters.area && filters.area !== 'All') {
      res = res.filter((loc) => loc.area === filters.area);
    }
    if (filters.maxDistance !== null && filters.maxDistance !== undefined && filters.maxDistance !== '') {
      const maxD = Number(filters.maxDistance);
      if (!Number.isNaN(maxD)) {
        res = res.filter((loc) => loc.distanceKm <= maxD);
      }
    }
    return res;
  }, [filters]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Map View ({visible.length})</h2>
      <div style={{ height: 500, marginTop: 12 }}>
        <MapContainer center={[USER_LAT, USER_LNG]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {visible.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div>
                  <strong>{loc.name}</strong>
                  <p style={{ margin: '6px 0' }}>{loc.description}</p>
                  <p>Events: {(loc.events || []).length}</p>
                  <button
                    onClick={() => navigate(`/locations/${loc.id}`)}
                    style={{ padding: '4px 8px', cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function FavouritesPage() {
  const [favs, setFavs] = useState([]);
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavs(raw);
  }, []);

  const favouriteLocations = useMemo(
    () => MOCK_LOCATIONS.filter((loc) => favs.includes(loc.id)),
    [favs]
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Favourites</h2>
      {favouriteLocations.length ? (
        <ul>
          {favouriteLocations.map((loc) => (
            <li key={loc.id}>
              <Link to={`/locations/${loc.id}`} style={styles.link}>
                {loc.name} — {loc.area}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No favourites yet. Add a favourite from a location page.</p>
      )}
    </div>
  );
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    fontSize: '14px',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#282c34',
    color: 'white',
    cursor: 'pointer',
    userSelect: 'none',
    border: '1px solid #ddd',
  },
  tr: {
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '12px',
    border: '1px solid #ddd',
  },
  link: {
    color: '#61dafb',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

function App() {
  const [filters, setFilters] = useState({
    keyword: '',
    area: 'All',
    maxDistance: '',
  });

  const uniqueAreas = useMemo(() => ['All', ...new Set(MOCK_LOCATIONS.map((l) => l.area))], []);

  return (
    <div className="App">
      <header style={{ backgroundColor: '#282c34', color: 'white', padding: 16 }}>
        <nav style={{ marginBottom: 12 }}>
          <Link to="/locations" style={{ marginRight: 16, color: '#61dafb', textDecoration: 'none' }}>
            Locations
          </Link>
          <Link to="/map" style={{ marginRight: 16, color: '#61dafb', textDecoration: 'none' }}>
            Map
          </Link>
          <Link to="/favourites" style={{ marginRight: 16, color: '#61dafb', textDecoration: 'none' }}>
            Favourites
          </Link>
          <Link to="/login" style={{ color: '#61dafb', textDecoration: 'none' }}>
            Login
          </Link>
        </nav>

        {/* Filters */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8 }}>
            Keyword:
            <input
              type="text"
              placeholder="Search name or description"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              style={{ marginLeft: 8, padding: 6, width: 220 }}
            />
          </label>

          <label style={{ marginLeft: 12, marginRight: 8 }}>
            Area:
            <select
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              style={{ marginLeft: 8, padding: 6 }}
            >
              {uniqueAreas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label style={{ marginLeft: 12 }}>
            Max Distance (km):
            <input
              type="number"
              min="0"
              placeholder="e.g., 5"
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
              style={{ marginLeft: 8, padding: 6, width: 100 }}
            />
          </label>

          <button
            onClick={() => setFilters({ keyword: '', area: 'All', maxDistance: '' })}
            style={{ ...styles.button, marginLeft: 12 }}
          >
            Clear Filters
          </button>
        </div>
      </header>

      <main style={{ padding: 0 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/locations" element={<Locations filters={filters} />} />
          <Route path="/locations/:id" element={<LocationDetail />} />
          <Route path="/map" element={<MapView filters={filters} />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/" element={<Locations filters={filters} />} />
          <Route
            path="*"
            element={
              <div style={{ padding: 20 }}>
                <h2>404</h2>
                <p>Page not found.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;