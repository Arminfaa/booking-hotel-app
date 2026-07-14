import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { formatMoney } from "../../utils/format";

function googleMapsDirectionsUrl(lat, lng, origin) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${lat},${lng}`,
    travelmode: "driving",
  });
  if (origin) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function openDirections(lat, lng) {
  const launch = (origin) => {
    window.open(
      googleMapsDirectionsUrl(lat, lng, origin),
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (!navigator.geolocation) {
    launch();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      launch({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    () => launch(),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
  );
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ hotels }) {
  const map = useMap();
  useEffect(() => {
    const points = hotels
      .map((h) => h.location?.coordinates)
      .filter((c) => Array.isArray(c) && c.length === 2)
      .map(([lng, lat]) => [lat, lng]);
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
      return;
    }
    map.fitBounds(points, { padding: [40, 40] });
  }, [hotels, map]);
  return null;
}

export default function HotelMap({ hotels = [], height = 420 }) {
  const fallback = [48.8566, 2.3522];

  return (
    <div
      className="hotel-map overflow-hidden rounded-cove border border-line max-[599px]:min-h-[300px]! max-[599px]:max-h-[calc(100dvh-280px)]!"
      style={{ height }}
    >
      <MapContainer
        center={fallback}
        zoom={3}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds hotels={hotels} />
        {hotels.map((hotel) => {
          const [lng, lat] = hotel.location?.coordinates || [];
          if (lat == null || lng == null) return null;
          return (
            <Marker key={hotel._id} position={[lat, lng]}>
              <Popup>
                <strong>{hotel.title}</strong>
                <br />
                {formatMoney(hotel.pricePerNight)} / night
                <div className="mt-2 flex flex-col gap-1.5">
                  <Link to={`/hotels/${hotel._id}`}>View stay</Link>
                  <button
                    type="button"
                    onClick={() => openDirections(lat, lng)}
                    className="inline-block w-full cursor-pointer rounded-cove-sm border border-line bg-sea/10 px-2.5 py-1 text-center text-[0.85rem] font-semibold text-sea transition-colors hover:bg-sea/20"
                  >
                    Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
