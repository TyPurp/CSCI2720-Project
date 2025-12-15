import React, { useEffect, useState } from 'react';
import useLocations from '../hooks/useLocations';
import styles from './styles';

export default function VenueSearchBar({ filters, setFilters }) {
  const [uniqueAreas, setUniqueAreas] = useState(['All']);
  const locations = useLocations();

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

  return (
    <div style={{ marginTop: 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minWidth: 280,
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search by location..."
          value={filters.keyword || ''}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 16,
            width: '100%'
          }}
        />
      </div>

      
      <div style={{
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minWidth: 180,
        position: 'relative'
      }}>
        <select
          value={filters.district || 'All'}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 16,
            width: '100%',
            appearance: 'none',
            paddingRight: 24,
            cursor: 'pointer'
          }}
        >
          {uniqueAreas.map((a) => (
            <option key={a} value={a}>
              {a} {a !== 'All' && `(${locations.filter(loc => loc.district === a).length})`}
            </option>
          ))}
        </select>
        <span style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          fontSize: 20,
          color: '#666'
        }}>▼</span>
      </div>

      
      <div style={{
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 300
      }}>
        <span style={{ fontSize: 16, whiteSpace: 'nowrap' }}>Distance (km)</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={filters.maxDistance || 0}
          onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
          style={{
            flex: 1,
            height: 8,
            background: '#ddd',
            borderRadius: 4,
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
        <span style={{ fontWeight: 'bold', minWidth: 50, textAlign: 'right' }}>
          {filters.maxDistance > 0 ? `${filters.maxDistance} km` : 'Any'}
        </span>
      </div>

      <button
        onClick={() => setFilters({ keyword: '', district: 'All', maxDistance: '' })}
        style={{ ...styles.button, alignSelf: 'center', fontSize: 16, fontWeight: '500', cursor: 'pointer', minWidth: 140 }}
      >
        Clear Filters
      </button>
    </div>
  );
}