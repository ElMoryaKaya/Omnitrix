import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Composant pour capturer les clics et ajouter des markers
function AddMarkerOnClick({ setMarkers }) {
  useMapEvents({
    click(e) {
      setMarkers((prev) => [...prev, e.latlng]);
    },
  });
  return null;
}

export default function MapView() {
  const [markers, setMarkers] = useState([]);

  return (
    <MapContainer
      center={[48.8566, 2.3522]} // Paris
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="/tiles/{z}/{x}/{y}.png" // ⚡ tuiles locales
        errorTileUrl="/tiles/empty.png" // image vide si tuile manquante
        maxZoom={18}
      />
      <AddMarkerOnClick setMarkers={setMarkers} />
      {markers.map((pos, idx) => (
        <Marker key={idx} position={pos}>
          <Popup>Point #{idx + 1}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
