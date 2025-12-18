import React, { useMemo, useState } from 'react'
import useLocations, { MOCK_LOCATIONS } from '../hooks/useLocations';
import useEvents from '../hooks/useEvents';
import { Link } from 'react-router-dom';

import styles from '../components/styles';
import VenueSearchBar from '../components/VenueSearchBar';
import NavBar from '../components/NavBar';
import useGeolocation from '../hooks/useGeolocation';

export default function Locations() {

  const userLocation = useGeolocation();

  const [sortConfig, setSortConfig] = useState({ field: 'name', order: 'asc' });
  const {locations} = useLocations();

  
  const [filters, setFilters] = useState({ keyword: '', area: 'All', maxDistance: '' });
  


  const visible = useEvents(locations, filters, sortConfig, userLocation);

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
        <p>{visible.length} result(s). Click headers to sort.</p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th} onClick={() => handleSort('name')}>Name {getSortIndicator('name')}</th>
              <th style={styles.th} onClick={() => handleSort('distance')}>Distance (km) {getSortIndicator('distance')}</th>
              <th style={styles.th} onClick={() => handleSort('events')}>Events {getSortIndicator('events')}</th>
              <th style={styles.th}>Area</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? visible.map((loc) => (
              <tr key={loc.id} style={styles.tr}>
                <td style={styles.td}>{loc.nameEn}</td>
                <td style={styles.td}>{loc.distanceKm.toFixed(1) > 0 ? loc.distanceKm.toFixed(1) : "Loading..."  }</td>
                <td style={styles.td}>{loc.eventCount}</td>
                <td style={styles.td}>{loc.district}</td>
                <td style={styles.td}><Link to={`/locations/${loc.id}`} style={styles.link}>View</Link></td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>No locations match your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

