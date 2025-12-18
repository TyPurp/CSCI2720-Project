import { useMemo } from "react";

// Haversine distance formula (km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function useEvents(locations, filters, sortConfig, userLocation) {
    return useMemo(() => {
        if (!userLocation) return locations;

        const withDistance = locations.map((loc) => {
            const dist = calculateDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude);
            return { ...loc, distanceKm: dist };
        });

        let result = withDistance;

        if (filters.keyword) {
            const kw = filters.keyword.toLowerCase();
            result = result.filter((loc) =>
            (loc.nameEn && loc.nameEn.toLowerCase().includes(kw)) ||
            (loc.addressEn && loc.addressEn.toLowerCase().includes(kw)) ||
            (loc.district && loc.district.toLowerCase().includes(kw)) ||
            (loc.venueId && loc.venueId.toLowerCase().includes(kw))
            );
        }

        if (filters.district && filters.district !== 'All') {
            result = result.filter((loc) => loc.district === filters.district);
        }

        if (filters.maxDistance !== '' && filters.maxDistance !== null && filters.maxDistance !== undefined && filters.maxDistance > 0) {
            const maxD = Number(filters.maxDistance);
            if (!Number.isNaN(maxD)) {
            result = result.filter((loc) => loc.distanceKm <= maxD);
            }
        }

        const { field, order } = sortConfig;
        const sorted = [...result].sort((a, b) => {
            let aVal, bVal;
            if (field === 'distance') {
            aVal = a.distanceKm; bVal = b.distanceKm;
            } else if (field === 'events') {
            aVal = a.eventCount || 0; bVal = b.eventCount || 0;
            } else if (field === 'name' || field === 'nameEn') {
            aVal = (a.nameEn || a[field] || '').toString().toLowerCase();
            bVal = (b.nameEn || b[field] || '').toString().toLowerCase();
            } else {
            aVal = (a[field] || '').toString().toLowerCase();
            bVal = (b[field] || '').toString().toLowerCase();
            }
            if (typeof aVal === 'string') {
            return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
            return order === 'asc' ? aVal - bVal : bVal - aVal;
            }
        });
        return sorted;
    }, [locations, filters, sortConfig, userLocation]);
}