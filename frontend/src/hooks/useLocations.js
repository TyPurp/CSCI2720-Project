import { useEffect, useState } from 'react';

import { fetchVenues } from '../api';

export const MOCK_LOCATIONS = [
  { id: 1, nameEn: 'Central Park', latitude: 40.7829, longitude: -73.9654, district: 'Manhattan', addressEn: 'Large public park in Manhattan.', eventCount: 3 },
  { id: 2, nameEn: 'Times Square', latitude: 40.7580, longitude: -73.9855, district: 'Manhattan', addressEn: 'Famous entertainment intersection.', eventCount: 3 },
  { id: 3, nameEn: 'Brooklyn Bridge', latitude: 40.7061, longitude: -73.9969, district: 'Brooklyn', addressEn: 'Historic suspension bridge.', eventCount: 3 },
  { id: 4, nameEn: 'Statue of Liberty', latitude: 40.6892, longitude: -74.0445, district: 'Harbour', addressEn: 'Iconic statue on Liberty Island.', eventCount: 3 },
  { id: 5, nameEn: 'Wall Street', latitude: 40.7074, longitude: -74.0113, district: 'Manhattan', addressEn: 'Financial district.', eventCount: 3 },
  { id: 6, nameEn: 'Empire State Building', latitude: 40.7484, longitude: -73.9857, district: 'Manhattan', addressEn: 'Historic skyscraper.', eventCount: 3 },
  { id: 7, nameEn: 'Grand Central', latitude: 40.7527, longitude: -73.9772, district: 'Manhattan', addressEn: 'Major transit hub.', eventCount: 3 },
  { id: 8, nameEn: 'High Line Park', latitude: 40.7480, longitude: -74.0048, district: 'Manhattan', addressEn: 'Elevated linear park.', eventCount: 3 },
];


export default function useLocations() {  
  const [locations, setLocations] = useState(MOCK_LOCATIONS);

  
    // If locationsSource provided (a URL), try to fetch; otherwise use MOCK
    useEffect(() => {   
      let cancelled = false;
      const apiBase = process.env.REACT_APP_API_BASE_URL;
      console.log('Locations useEffect — API base:', apiBase);
      if (apiBase) {
        (async () => {
          try {
            const data = await fetchVenues();
            if (!cancelled && Array.isArray(data)) setLocations(data);
          } catch (err) {
            console.warn('Failed to fetch venues from backend, using mock data', err);
          }
        })();
      }
      return () => { cancelled = true; };
    }, []);
  

    return locations;
}