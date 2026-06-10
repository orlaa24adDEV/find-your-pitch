import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

interface MapPreviewProps {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

const MapPreview = ({ lat, lng, address, name }: MapPreviewProps) => (
  <div className="rounded-xl overflow-hidden border border-ink-100 h-56">
    <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <strong>{name}</strong>
          <br />
          {address}
        </Popup>
      </Marker>
    </MapContainer>
  </div>
);

export default MapPreview;
