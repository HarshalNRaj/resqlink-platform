import React, { useEffect, useRef } from "react";

export function MapView({ items = [], center = [12.2958, 76.6394], zoom = 13, height = "360px" }) {
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof window === "undefined" || !window.L) return;

    if (!leafletMapInstance.current) {
      leafletMapInstance.current = window.L.map(mapRef.current).setView(center, zoom);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(leafletMapInstance.current);
    }

    const map = leafletMapInstance.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    items.forEach((item) => {
      if (item.lat && item.lng) {
        const marker = window.L.marker([item.lat, item.lng]).addTo(map);
        const title = item.title || item.hospital_name || item.description || "Location";
        const addr = item.address_text || "";
        const status = item.status || "";
        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 140px;">
            <strong style="display:block; margin-bottom: 2px;">${title}</strong>
            <small style="color: #64748b; display: block; margin-bottom: 4px;">${addr}</small>
            <span style="font-size: 10px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${status}</span>
          </div>
        `);
      }
    });

    return () => {
      // Keep map instance alive across rerenders or clean up on unmount
    };
  }, [items, center, zoom]);

  return (
    <div
      id="resqlink-map-container"
      className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative"
      style={{ height }}
    >
      <div ref={mapRef} className="w-full h-full" id="resqlink-leaflet-map" />
    </div>
  );
}

export default MapView;
