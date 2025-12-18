import React, { useEffect, useState } from 'react';
import useLocations from '../hooks/useLocations';
import styles from './styles';

export default function VenueSearchBar({ filters, setFilters }) {
  const [uniqueAreas, setUniqueAreas] = useState(['All']);
  const { locations } = useLocations();

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

  const controlHeight = '52px';

  const containerStyle = {
    marginTop: 20,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'space-between',  // ← Even distribution
  };

  const controlsWrapperStyle = {
    display: 'flex',
    flex: '1 1 600px',                 // Takes available space, min ~600px before wrapping
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',     // Evenly space the three filters
  };

  const commonBoxStyle = {
    height: controlHeight,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '0 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 240px',                 // Each filter grows equally, min width 240px
  };

  const searchInputStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 16,
    width: '100%',
    color: 'black',
  };

  const selectBoxStyle = {
    ...commonBoxStyle,
    position: 'relative',
  };

  const selectStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 16,
    width: '100%',
    height: '100%',
    paddingRight: 30,
    cursor: 'pointer',
    color: 'black',
    appearance: 'none',
  };

  const distanceBoxStyle = {
    ...commonBoxStyle,
    gap: 12,
  };

  const distanceTextStyle = {
    fontSize: 16,
    whiteSpace: 'nowrap',
    color: 'black',
  };

  const rangeStyle = {
    flex: 1,
    height: 8,
    background: '#ddd',
    borderRadius: 4,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  };

  const distanceValueStyle = {
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
    color: 'black',
    fontSize: 16,
  };

  const arrowStyle = {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: 20,
    color: '#666',
  };

  const clearButtonStyle = {
    ...styles.button,
    height: controlHeight,
    fontSize: 16,
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: 140,
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid #ccc',
    padding: '0 24px',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    alignSelf: 'center',
  };

  return (
    <div style={containerStyle}>
      {/* Wrapper for the three filters – evenly distributed */}
      <div style={controlsWrapperStyle}>
        {/* Search Input */}
        <div style={commonBoxStyle}>
          <input
            type="text"
            placeholder="Search by location..."
            value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            style={searchInputStyle}
          />
        </div>

        {/* District Select */}
        <div style={selectBoxStyle}>
          <select
            value={filters.district || 'All'}
            onChange={(e) => setFilters({ ...filters, district: e.target.value === 'All' ? '' : e.target.value })}
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

        {/* Distance Slider */}
        <div style={distanceBoxStyle}>
          <span style={distanceTextStyle}>Distance (km)</span>
          <input
            type="range"
            min="0"
            max="70"
            step="1"
            value={filters.maxDistance || 0}
            onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
            style={rangeStyle}
          />
          <span style={distanceValueStyle}>
            {filters.maxDistance > 0 ? `${filters.maxDistance} km` : 'Any'}
          </span>
        </div>
      </div>

      {/* Clear button stays on the right */}
      <button
        onClick={() => setFilters({ keyword: '', district: '', maxDistance: '' })}
        style={clearButtonStyle}
      >
        Clear Filters
      </button>
    </div>
  );
}