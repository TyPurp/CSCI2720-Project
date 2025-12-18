import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useVenue from "../hooks/useVenue";
import { getFavourites, toggleFavourite } from "../api";
import styles from "../components/styles";
import Map from "../components/Map";
import CommentsSection from "../components/CommentSection";
import useAuth from "../hooks/useAuth";
import NavBar from "../components/NavBar";

export default function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const locId = id;

  const { user } = useAuth();
  const venue = useVenue(locId);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const apiBase = process.env.REACT_APP_API_BASE_URL;
    if (apiBase) {
      getFavourites(user?.username).then((favs) => {
        if (!cancelled) setIsFav(Array.isArray(favs) ? favs.filter(loc => loc.venueId == locId).length > 0 : false);
      }).catch(() => {
        const raw = JSON.parse(localStorage.getItem('favourites') || '[]');
        if (!cancelled) setIsFav(raw.includes(locId));
      });
    } else {
      const raw = JSON.parse(localStorage.getItem('favourites') || '[]');
      setIsFav(raw.includes(locId));
    }
    return () => { cancelled = true; };
  }, [locId]);

  const handleToggleFav = async () => {
    try {
      const resp = await toggleFavourite(user?.username, locId);
      if (resp && Array.isArray(resp.favourites)) {
        setIsFav(resp.favourites.includes(locId));
      } else if (typeof resp === 'boolean') {
        setIsFav(resp);
      } else {
        const favs = await getFavourites();
        setIsFav(Array.isArray(favs) ? favs.includes(locId) : false);
      }
      return;
    } catch (err) {
      console.warn('toggleFavourite failed, falling back to localStorage', err);
    }
  };

  if (venue === null) {
    return <div style={{ padding: 20 }}><h2>Loading...</h2></div>;
  }

  if (!venue) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Location not found</h2>
        <button onClick={() => navigate('/locations')} style={styles.button}>Back to list</button>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div style={{ padding: 20 }}>
        <h2>{venue.nameEn}</h2>
        <p>{venue.addressEn}</p>
        <p>{venue.district}</p>
        <p><strong>Coordinates:</strong> {venue.latitude}, {venue.longitude}</p>

        <div style={{ height: 300, marginBottom: 12 }}>
          <Map events={[venue]} centerOnUser={false} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <button onClick={handleToggleFav} style={{ ...styles.button, marginRight: 8 }}>
            {isFav ? 'Remove Favourite' : 'Add Favourite'}
          </button>
          <Link to="/locations" style={{ ...styles.link, marginLeft: 8 }}>Back to locations</Link>
        </div>

        <section style={{ marginTop: 16 }}>
          <h3>Events</h3>
          {(venue.events || []).length ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {(venue.events || []).map((e) => (
                <li key={e._id} style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>{e.titleEn}</strong>
                    <div style={{ color: 'var(--text-color)', opacity: 0.8, marginTop: '5px' }}>
                      {e.dateTime} • {e.presenterEn}
                    </div>
                    {e.description && (
                      <div style={{ marginTop: '8px', fontSize: '14px' }}>
                        {e.description}
                      </div>
                    )}
                  </div>
                
                </li>
              ))}
            </ul>
          ) : <p>No events listed.</p>}
        </section>

        <CommentsSection locationId={locId} />
      </div>
    </div>
  );
}