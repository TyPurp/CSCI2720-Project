const convert = require('xml-js');

async function fetchVenueData() {

    const data = await fetch("https://www.lcsd.gov.hk/datagovhk/event/venues.xml");

    const text = await data.text();

    const xmlData = convert.xml2js(text, { compact: true, spaces: 4 });
    const venuesRaw = xmlData.venues.venue.map(venue => {
        // console.log(venue);
        const venueId = venue._attributes.id;
        const nameEn = venue.venuee._cdata;
        const events = [];
        const longitude = venue.longitude?._cdata || 0.0;
        const latitude = venue.latitude?._cdata || 0.0;

        

        return { venueId, nameEn, events, longitude, latitude };
    });

    var venues = await Promise.all(
        venuesRaw.map(async venue => {
            const { nameEn } = venue;
            let addressEn = "";
            let district = "";

            try {
                const locationData = await fetch(
                    "https://www.map.gov.hk/gs/api/v1.0.0/locationSearch?q=" + encodeURIComponent(nameEn)
                );
                if (locationData.ok) {
                    const locationJson = await locationData.json();
                    addressEn = locationJson[0]?.addressEN || locationJson[1]?.addressEN || locationJson[0]?.addressZH || locationJson[1]?.addressZH || "";
                    district = locationJson[0]?.districtEN || locationJson[1]?.districtEN || locationJson[0]?.districtZH || locationJson[1]?.districtZH || "";
                    if (venue.longitude == 0.0 || venue.latitude == 0.0) {
                        const geoData = await fetch(
                            `https://www.geodetic.gov.hk/transform/v2/?e=${locationJson[0]?.x}&n=${locationJson[0]?.y}&inSys=hkgrid&to=EPSG:4326`
                        );
    
                        if (geoData.ok) {
                            const geoJson = await geoData.json();
                            venue.longitude = geoJson.wgsLong;
                            venue.latitude = geoJson.wgsLat;
                        }
                    }
                }


            } catch (err) {
                // Leave as empty strings on error
            }

            return { ...venue, addressEn, district };
        })
    );


    const events = await fetch("https://www.lcsd.gov.hk/datagovhk/event/events.xml");
    const eventsText = await events.text();
    const eventsXmlData = convert.xml2js(eventsText, { compact: true, spaces: 4 });

    eventsXmlData.events.event.forEach(event => {
        // console.log(event);
        const eventId = event._attributes.id;
        const titleEn = event.titlee._cdata == "--" ? event.titlee._cdata : event.titlec._cdata;
        const venueId = event.venueid._cdata;
        const dateTime = event.predateE._cdata;
        const presenterEn = event.presenterorge._cdata || "";

        venues.forEach(venue => {
            if (venue.venueId === venueId) {
                venue.events.push({ titleEn, dateTime, presenterEn });
            }
        });
    })

    venues = venues.filter(venue => venue.events.length >= 3);

    return { venues };

  // Simulated venue data fetching logic
  return {
        venues: [
        {
            venueId: 'v1',
            nameEn: 'Venue One',
            events: [
            { eventId: 'e1', name: 'Event One' },
                { eventId: 'e2', name: 'Event Two' }
            ]
        }
        ]
    };
}

module.exports = fetchVenueData;