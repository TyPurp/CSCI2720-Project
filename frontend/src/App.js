// frontend/src/App.js
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigate } from 'react-router-dom';

import Login from './routes/login';
import Logout from './routes/logout';
import Locations from './routes/locations';
import LocationDetail from './routes/location_details';
import MapView from './routes/map_view';
import FavouritesPage from './routes/favourites';

// Fix default marker icons in react-leaflet (CRA-compatible)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {

  // User location state (gets updated with browser geolocation if allowed)
  return (
    <div className="App">
      

      <main style={{ padding: 0 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:id" element={<LocationDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/favourites" element={<FavouritesPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div style={{ padding: 20 }}><h2>404</h2><p>Page not found.</p></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;