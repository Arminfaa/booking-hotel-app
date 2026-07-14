import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [35.6892, 51.389];

function parseCoord(value) {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function MapViewSync({ latitude, longitude, hasPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!hasPosition) return;
    map.setView([latitude, longitude], Math.max(map.getZoom(), 14), {
      animate: true,
    });
  }, [latitude, longitude, hasPosition, map]);

  return null;
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  height = 300,
}) {
  const lat = parseCoord(latitude);
  const lng = parseCoord(longitude);
  const hasPosition = lat != null && lng != null;

  const center = useMemo(
    () => (hasPosition ? [lat, lng] : DEFAULT_CENTER),
    [hasPosition, lat, lng]
  );

  function pickLocation(nextLat, nextLng) {
    onChange({
      latitude: Number(nextLat.toFixed(6)),
      longitude: Number(nextLng.toFixed(6)),
    });
  }

  return (
    <div className="overflow-hidden rounded-cove border border-line">
      <div style={{ height }}>
        <MapContainer
          center={center}
          zoom={hasPosition ? 14 : 5}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapViewSync
            latitude={lat ?? DEFAULT_CENTER[0]}
            longitude={lng ?? DEFAULT_CENTER[1]}
            hasPosition={hasPosition}
          />
          <MapClickHandler onPick={pickLocation} />
          {hasPosition ? (
            <Marker
              position={[lat, lng]}
              draggable
              eventHandlers={{
                dragend(event) {
                  const { lat: nextLat, lng: nextLng } = event.target.getLatLng();
                  pickLocation(nextLat, nextLng);
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>
      <p className="border-t border-line px-3 py-2 text-[0.85rem] text-muted">
        {hasPosition
          ? `Selected: ${lat.toFixed(6)}, ${lng.toFixed(6)} — click the map or drag the pin to adjust.`
          : "Click the map to place your listing."}
      </p>
    </div>
  );
}
