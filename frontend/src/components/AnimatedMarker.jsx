import { useEffect, useRef, useState } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

const createBeautifulCarIcon = (bearing = 0, isMoving = false, color = "#3b82f6") => {
  const pulse = isMoving ? `
    <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="1.5s" repeatCount="indefinite"/>
  ` : "";

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feFlood flood-color="${color}" flood-opacity="0.8"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/><feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
    </defs>

    <!-- Car Body -->
    <path fill="url(#grad)" d="M54 28h-4l-6-12H20l-6 12h-4v8h4v12h8V36h22v12h8V36h4v-8z" filter="url(#glow)">
      ${pulse}
    </path>

    <!-- Windows -->
    <path fill="#1e293b" opacity="0.7" d="M24 32h16v8H24z"/>
    <path fill="#f1f5f9" d="M26 34h12v4H26z"/>

    <!-- Wheels -->
    <circle fill="#1e293b" cx="22" cy="44" r="6">
      <animateTransform attributeName="transform" type="rotate" from="0 22 44" to="360 22 44" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle fill="#1e293b" cx="42" cy="44" r="6">
      <animateTransform attributeName="transform" type="rotate" from="0 42 44" to="360 42 44" dur="2s" repeatCount="indefinite"/>
    </circle>

    <!-- Headlights -->
    <circle fill="#fbbf24" opacity="0.8" cx="50" cy="30" r="3"/>
    <circle fill="#fbbf24" opacity="0.8" cx="14" cy="30" r="3"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-car-icon",
  });
};

export default function AnimatedMarker({ position, info, color = "#3b82f6", isMoving = false }) {
  const markerRef = useRef(null);
  const [showCard, setShowCard] = useState(false);
  const prevPos = useRef(position);

  useEffect(() => {
    if (!markerRef.current || !position) return;

    const marker = markerRef.current;
    const start = marker.getLatLng();
    const end = L.latLng(position);

    if (start.equals(end)) return;

    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    const bearing = Math.atan2(dx, dy) * (180 / Math.PI) + 90;

    marker.setIcon(createBeautifulCarIcon(bearing, true, color));

    const startTime = performance.now();
    const duration = 1800;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;
      marker.setLatLng([lat, lng]);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          if (marker.getLatLng().equals(end)) {
            marker.setIcon(createBeautifulCarIcon(bearing, false, color));
          }
        }, 500);
      }
    };

    requestAnimationFrame(animate);
    prevPos.current = position;
  }, [position, color]);

  return (
    <>
      <Marker
        ref={markerRef}
        position={position}
        icon={createBeautifulCarIcon(0, false, color)}
        eventHandlers={{
          mouseover: () => setShowCard(true),
          mouseout: () => setShowCard(false),
        }}
      />
      {showCard && (
        <div
          className="absolute bg-white shadow-lg rounded-xl border p-4 w-80 text-sm"
          style={{
            left: "50%",
            bottom: "70px",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                WIRELESS
              </div>
            </div>
            <div className="text-gray-500 text-xs">{info.time}</div>
          </div>
          <p className="font-medium mb-2">28, Vijay Nagar Rd, Deolali, Nashik</p>

          <div className="grid grid-cols-3 gap-3 mb-2 text-center">
            <div>
              <div className="font-bold text-green-600">{info.speed} km/h</div>
              <div className="text-gray-500 text-xs">Speed</div>
            </div>
            <div>
              <div className="font-bold">0.00 km</div>
              <div className="text-gray-500 text-xs">Distance</div>
            </div>
            <div>
              <div className="font-bold text-green-600">16%</div>
              <div className="text-gray-500 text-xs">Battery</div>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Today Running:</span>
              <span>00h 00m</span>
            </div>
            <div className="flex justify-between">
              <span>Today Stopped:</span>
              <span>07h 10m</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-red-600 font-semibold">STOPPED</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
