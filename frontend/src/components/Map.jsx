
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { divIcon } from 'leaflet';
import useGeolocation from '../hooks/useGeolocation';

const myCustomColour = '#a4f6ffff'
const borderColour = '#37b0dcff'

const markerHtmlStyles = `
  background-color: ${myCustomColour};
  width: 1rem;
  height: 1rem;
  display: block;
  border-radius: 3rem 3rem;
  transform: translate(-50%, -50%);

  border: 0.4rem solid ${borderColour};
  opacity: 0.95;
  `

const icon = divIcon({
  className: "my-custom-pin",
  iconAnchor: [0, 0],
  labelAnchor: [0, 0],
  popupAnchor: [0, -15],
  html: `<span style="${markerHtmlStyles}" />`
})

export default function Map({
    events,
    centerOnUser = true
}) {
  const navigate = useNavigate();
  const userLocation = useGeolocation();

  return (
    (userLocation && userLocation.lat && userLocation.lng) ? <MapContainer
            center={centerOnUser ? [userLocation.lat, userLocation.lng] : [events[0].latitude, events[0].longitude]} zoom={13} style={{ height: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker icon={icon} position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div>
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>
        {events.map((loc) => {
          const { latitude, longitude, nameEn, venueId, addressEn, eventCount } = loc;

          return <Marker key={venueId} position={[latitude, longitude]}>
              <Popup>
                <div>
                  <strong>{nameEn}</strong>
                  <p style={{ margin: '6px 0' }}>{addressEn}</p>
                  <p>Events: {eventCount}</p>
                  <button onClick={() => navigate(`/locations/${venueId}`)} style={{ padding: '4px 8px', cursor: 'pointer' }}>View Details</button>
                </div>
              </Popup>
          </Marker>
        })}
    </MapContainer> : <div>Loading Map...</div>
  )
}
