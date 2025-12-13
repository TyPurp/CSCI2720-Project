import React, { useEffect, useMemo, useState } from 'react'
import useLocations from '../hooks/useLocations';
import styles from './styles';

export default function VenueSearchBar({ filters, setFilters }) {
    
  const [uniqueAreas, setUniqueAreas] = useState(['All'])

  const locations = useLocations();

  async function fetchAreas() { 
    const areasSet = new Set();

    locations.forEach((loc) => {
        if (loc.district) {
            areasSet.add(loc.district);
        }
    });

    const areasArray = Array.from(areasSet).sort();
    areasArray.unshift('All');
    return areasArray;
  }




  useEffect(() => {
    let cancelled = false;
    fetchAreas().then((areas) => {
        if (!cancelled) {
            setUniqueAreas(areas);
        }
    });
    return () => { cancelled = true; };
  }, [locations]);

  return (
    <div style={{ marginTop: 20, marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>
        Keyword:
        <input type="text" placeholder="Search name or description" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} style={{ marginLeft: 8, padding: 6, width: 220 }} />
        </label>

        <label style={{ marginLeft: 12, marginRight: 8 }}>
        Area:
        <select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} style={{ marginLeft: 8, padding: 6 }}>
            {uniqueAreas.map((a) => <option key={a} value={a}>{a} ({a == 'All' ? locations.length : locations.filter(loc => loc.district == a).length})</option>)}
        </select>
        </label>

        <label style={{ marginLeft: 12 }}>
        Max Distance (km):
        <input type="number" min="0" placeholder="e.g., 5" value={filters.maxDistance} onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })} style={{ marginLeft: 8, padding: 6, width: 100 }} />
        </label>

        <button onClick={() => setFilters({ keyword: '', area: 'All', maxDistance: '' })} style={{ ...styles.button, marginLeft: 12 }}>Clear Filters</button>
    </div>
  )
}
