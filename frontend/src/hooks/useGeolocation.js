import { useEffect, useState } from "react";

export default function useGeolocation() {

    const [userLocation, setUserLocation] = useState({ lat: NaN, lng: NaN });

    useEffect(() => {
        if (!navigator.geolocation) return;
        let didCancel = false;
        navigator.geolocation.getCurrentPosition(
        (pos) => {
            if (!didCancel) {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            console.log('User location obtained:', pos.coords.latitude, pos.coords.longitude);
            }
        },
        (err) => {
            console.warn('Geolocation failed or permission denied', err);
        },
        { enableHighAccuracy: true, maximumAge: 60000 }
        );
        return () => { didCancel = true; };
    }, []);

    return userLocation;
}