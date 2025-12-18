import React, { useMemo, useState } from 'react'
import useLocations from '../hooks/useLocations';
import useEvents from '../hooks/useEvents';
import { Link } from 'react-router-dom';

import styles from '../components/styles';
import VenueSearchBar from '../components/VenueSearchBar';
import NavBar from '../components/NavBar';
import useGeolocation from '../hooks/useGeolocation';

export default function Locations() {

  const userLocation = useGeolocation();

  const [sortConfig, setSortConfig] = useState({ field: 'name', order: 'asc' });
  const { locations } = useLocations();

  const [filters, setFilters] = useState({ keyword: '', area: 'All', maxDistance: '' });

  // Compute the fully filtered & sorted list
  const visible = useEvents(locations, filters, sortConfig, userLocation);

  // Toggle between showing 10 or all
  const [showAll, setShowAll] = useState(false);

  const displayedLocations = useMemo(() => {
    return showAll ? visible : visible.slice(0, 10);
  }, [visible, showAll]);

  const hasMore = visible.length > 10;

  const toggleShowAll = () => {
    setShowAll(prev => !prev);
  };

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
    <div>
      <NavBar>
        <VenueSearchBar filters={filters} setFilters={setFilters} />
      </NavBar>
      <div style={{ padding: 20, textAlign: 'left' }}>

        <h2>Locations</h2>
        <p>
          Showing {displayedLocations.length} of {visible.length} result(s). Click headers to sort.
        </p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th} onClick={() => handleSort('nameEn')}>Name {getSortIndicator('name')}</th>
              <th style={styles.th} onClick={() => handleSort('distance')}>Distance (km) {getSortIndicator('distance')}</th>
              <th style={styles.th} onClick={() => handleSort('events')}>Events {getSortIndicator('events')}</th>
              <th style={styles.th}>Area</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedLocations.length ? displayedLocations.map((loc) => (
              <tr key={loc.id} style={styles.tr}>
                <td style={styles.td}>{loc.nameEn}</td>
                <td style={styles.td}>
                  {loc.distanceKm.toFixed(1) > 0 ? loc.distanceKm.toFixed(1) : "Loading..."}
                </td>
                <td style={styles.td}>{loc.eventCount}</td>
                <td style={styles.td}>{loc.district}</td>
                <td style={styles.td}>
                  <Link to={`/locations/${loc.id}`} style={styles.link}>View</Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>
                  No locations match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Toggle Button - only show if there are more than 10 results */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={toggleShowAll}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#3f80c5ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3f80c5ff'}
            >
              {showAll ? 'Show less locations' : 'Show more locations'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}