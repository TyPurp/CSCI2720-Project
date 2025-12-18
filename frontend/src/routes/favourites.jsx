import { useEffect, useMemo, useState } from "react";
import { getFavourites } from "../api";
import useAuth from "../hooks/useAuth";
import styles from "../components/styles";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function FavouritesPage() {
  const [favs, setFavs] = useState([]);
  const { user } = useAuth();

  const apiBase = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;
    if (apiBase) {
      getFavourites(user?.username)
        .then((data) => {
          if (!cancelled && Array.isArray(data)) setFavs(data);
        })
        .catch(() => {
          const raw = JSON.parse(localStorage.getItem("favourites") || "[]");
          if (!cancelled) setFavs(raw);
        });
    } else {
      const raw = JSON.parse(localStorage.getItem("favourites") || "[]");
      setFavs(raw);
    }
    return () => { cancelled = true; };
  }, [user]);

  const removeFavourite = (venueId) => {
    const updated = favs.filter((loc) => loc.venueId !== venueId);
    setFavs(updated);

    // Sync with localStorage (fallback)
    localStorage.setItem("favourites", JSON.stringify(updated));

  };

  return (
    <div>
      <NavBar />
      <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 24 }}>Favourites</h2>

        {favs.length ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {favs.map((loc) => (
              <li
                key={loc.venueId}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <Link
                    to={`/locations/${loc.venueId}`}
                    style={{
                      ...styles.link,
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#333",
                      textDecoration: "none",
                    }}
                  >
                    {loc.nameEn}
                  </Link>
                  <p style={{ margin: "6px 0 0", color: "#666", fontSize: 14 }}>
                    {loc.addressEn}
                  </p>
                </div>

                <button
                  onClick={() => removeFavourite(loc.venueId)}
                  style={{
                    backgroundColor: "#e0f1f5ff",
                    color: "black",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    minWidth: 160,
                    flexShrink: 0,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e0f1f5ff")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e0f1f5ff")}
                >
                  Remove from favourite
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666", fontSize: 16 }}>
            No favourites yet. Add a favourite from a location page.
          </p>
        )}
      </div>
    </div>
  );
}