import { useEffect, useMemo, useState } from "react";
import { getFavourites } from "../api";
import useAuth from "../hooks/useAuth";
import styles from "../components/styles";
import { Link } from "react-router-dom";
import { MOCK_LOCATIONS } from "../hooks/useLocations";
import NavBar from "../components/NavBar";

export default function FavouritesPage() {
  const [favs, setFavs] = useState([]);
  const { user } = useAuth();

  const apiBase = process.env.REACT_APP_API_BASE_URL;
    
  useEffect(() => {
    let cancelled = false;
    if (apiBase) {
      getFavourites(user?.username).then((data) => { if (!cancelled && Array.isArray(data)) setFavs(data); }).catch(() => {
        const raw = JSON.parse(localStorage.getItem('favourites') || '[]');
        if (!cancelled) setFavs(raw);
      });
    } else {
      const raw = JSON.parse(localStorage.getItem('favourites') || '[]');
      setFavs(raw);
    }
    return () => { cancelled = true; };
  }, [user]);


  return (
    <div>
        <NavBar />
        <div style={{ padding: 20 }}>
        <h2>Favourites</h2>
        {favs.length ? (
            <ul>{favs.map((loc) => <li key={loc.venueId}><Link to={`/locations/${loc.venueId}`} style={styles.link}>{loc.nameEn} — {loc.addressEn}</Link></li>)}</ul>
        ) : <p>No favourites yet. Add a favourite from a location page.</p>}
        </div>
    </div>
  );
}