/*
CSCI2720 Project:
Members:
Chow Ho Yee (1155214324)
Ho Chi Tung (1155213294)
Lam Tsz Yi (1155212543)
 */
import React, { useState } from 'react'
import useLocations from '../hooks/useLocations';
import useEvents from '../hooks/useEvents';
import Map from '../components/Map';
import NavBar from '../components/NavBar';
import VenueSearchBar from '../components/VenueSearchBar';
import useGeolocation from '../hooks/useGeolocation';

export default function MapView() {
  const [sortConfig, setSortConfig] = useState({ field: 'distance', order: 'asc' });
  const [filters, setFilters] = useState({ keyword: '', area: 'All', maxDistance: '' });
  const {locations} = useLocations();
  const userLocation = useGeolocation();
  const visible = useEvents(locations, filters, sortConfig, userLocation);

  return (
    <div>
        <NavBar>
            <VenueSearchBar filters={filters} setFilters={setFilters} />
        </NavBar>
        <div style={{ padding: 20 }}>
        <h2>Map View ({visible.length})</h2>
        <div style={{ height: 500, marginTop: 12 }}>
            <Map events={visible}/>
        </div>
        </div>
    </div>
  );
}
