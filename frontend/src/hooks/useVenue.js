/*
CSCI2720 Project:
Members:
Chow Ho Yee (1155214324)
Ho Chi Tung (1155213294)
Lam Tsz Yi (1155212543)
 */
import { useEffect, useState } from "react";
import { fetchEvents, fetchVenue } from "../api";

export default function useVenue(venueId) {
    const [venue, setVenue] = useState(null);

    useEffect(() => {

        let cancelled = false;
        const apiBase = process.env.REACT_APP_API_BASE_URL;

        if (!apiBase) return;

        (async () => {
            try {
                const venue = await fetchVenue(venueId);
                const events = await fetchEvents(venueId).catch(() => []);
                if (!cancelled) setVenue({ ...venue, events: events });
            } catch (err) {
                console.warn('Failed to fetch venue data', err);
                // if (!cancelled) setVenue(MOCK_LOCATIONS.find(l => l.id === venueId) || null);
            }
        })();
    }, [venueId]);

    return venue;
}