import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Default Leaflet marker icons reference bundled image paths that Vite
// doesn't resolve automatically — point them at the CDN copies instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MYSURU_CENTER = [12.2958, 76.6394];

export default function MapView({ markers = [], height = 360 }) {
  const withCoords = markers.filter((m) => m.lat && m.lng);
  const center = withCoords.length ? [withCoords[0].lat, withCoords[0].lng] : MYSURU_CENTER;

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border border-line">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>
              <strong>{m.title}</strong>
              {m.subtitle && <div className="text-xs text-ink-soft">{m.subtitle}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
