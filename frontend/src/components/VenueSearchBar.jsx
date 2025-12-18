import React, { useEffect, useState } from 'react';
import useLocations from '../hooks/useLocations';
import styles from './styles';

export default function VenueSearchBar({ filters, setFilters }) {
    
  const [uniqueAreas, setUniqueAreas] = useState(['All'])

  const {locations} = useLocations();

  async function fetchAreas() {
    const areasSet = new Set();
    locations.forEach((loc) => {
      if (loc.district) areasSet.add(loc.district);
    });
    const areasArray = Array.from(areasSet).sort();
    areasArray.unshift('All');
    return areasArray;
  }

  useEffect(() => {
    let cancelled = false;
    fetchAreas().then((areas) => {
      if (!cancelled) setUniqueAreas(areas);
    });
    return () => { cancelled = true; };
  }, [locations]);

  const containerStyle = {
    marginTop: 20,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  };

  const searchBoxStyle = {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minWidth: 280,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc'
  };

  const searchInputStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 16,
    width: '100%',
    color: 'black'
  };

  const selectBoxStyle = {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minWidth: 180,
    position: 'relative',
    border: '1px solid #ccc'
  };

  const selectStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 16,
    width: '100%',
    appearance: 'none',
    paddingRight: 24,
    cursor: 'pointer',
    color: 'black'
  };

  const distanceBoxStyle = {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 300,
    border: '1px solid #ccc'
  };

  const distanceTextStyle = {
    fontSize: 16,
    whiteSpace: 'nowrap',
    color: 'black'
  };

  const rangeStyle = {
    flex: 1,
    height: 8,
    background: '#ddd',
    borderRadius: 4,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer'
  };

  const distanceValueStyle = {
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
    color: 'black'
  };

  const arrowStyle = {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: 20,
    color: '#666'
  };

  const clearButtonStyle = {
    ...styles.button,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: 140,
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid #ccc'
  };

  return (
    <div style={containerStyle}>
      <div style={searchBoxStyle}>
        <input
          type="text"
          placeholder="Search by location..."
          value={filters.keyword || ''}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          style={searchInputStyle}
        />
      </div>

      <div style={selectBoxStyle}>
        <select
          value={filters.district || 'All'}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
          style={selectStyle}
        >
          {uniqueAreas.map((a) => (
            <option key={a} value={a} style={{ color: 'black', backgroundColor: 'white' }}>
              {a} {a !== 'All' && `(${locations.filter(loc => loc.district === a).length})`}
            </option>
          ))}
        </select>
        <span style={arrowStyle}>▼</span>
      </div>

      <div style={distanceBoxStyle}>
        <span style={distanceTextStyle}>Distance (km)</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={filters.maxDistance || 0}
          onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
          style={rangeStyle}
        />
        <span style={distanceValueStyle}>
          {filters.maxDistance > 0 ? `${filters.maxDistance} km` : 'Any'}
        </span>
      </div>

      <button
        onClick={() => setFilters({ keyword: '', district: 'All', maxDistance: '' })}
        style={clearButtonStyle}
      >
        Clear Filters
      </button>
    </div>
  );
}