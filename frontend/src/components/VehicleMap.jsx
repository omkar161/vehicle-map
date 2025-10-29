import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import AnimatedMarker from "./AnimatedMarker";
import HistoryPanel from "./HistoryPanel";
import { calculateSpeedKmH } from "../utils/calculateSpeed";
import { snapRouteToRoad } from "../utils/snapToRoad";
import "leaflet/dist/leaflet.css";

const INITIAL_CENTER = [17.385044, 78.486671];

export default function VehicleMap() {
  const [rawRoute, setRawRoute] = useState([]);
  const [snappedRoute, setSnappedRoute] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const intervalRef = useRef(null);

  // Load route
  useEffect(() => {
    const loadRoute = async () => {
      const response = await fetch("/dummy-route.json");
      const data = await response.json();
      const raw = data.map((p) => ({
        lat: p.latitude,
        lng: p.longitude,
        timestamp: p.timestamp,
      }));
      setRawRoute(raw);
      const snapped = await snapRouteToRoad(raw);
      setSnappedRoute(snapped);
    };
    loadRoute();
  }, []);

  // Function to get history data based on period
  const getHistoryForPeriod = (period) => {
    if (!snappedRoute.length) return [];
    switch (period) {
      case "Yesterday":
        return snappedRoute.slice(0, Math.floor(snappedRoute.length / 2)).reverse();
      case "This Week":
        return snappedRoute.slice(0, Math.floor(snappedRoute.length * 0.8));
      default:
        return snappedRoute;
    }
  };

  // When "SHOW" clicked
  const handleShow = () => {
    const data = getHistoryForPeriod(selectedPeriod);
    setHistoryData(data);
    setIsHistoryMode(true);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  // Change route when period changes (inside history)
  useEffect(() => {
    if (isHistoryMode && snappedRoute.length) {
      const data = getHistoryForPeriod(selectedPeriod);
      setHistoryData(data);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  }, [selectedPeriod, isHistoryMode, snappedRoute]);

  // Exit history
  const handleExit = () => {
    setIsHistoryMode(false);
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  // Animation playback
  useEffect(() => {
    if (isPlaying && currentIndex < historyData.length - 1) {
      const interval = 2000 / speed;
      intervalRef.current = setInterval(() => {
        setCurrentIndex((i) => i + 1);
      }, interval);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentIndex, historyData, speed]);

  const currentPos = isHistoryMode
    ? historyData[currentIndex] || historyData[0]
    : snappedRoute[snappedRoute.length - 1] || snappedRoute[0];

  const info = currentPos
    ? {
        lat: currentPos.lat.toFixed(6),
        lng: currentPos.lng.toFixed(6),
        time: new Date(currentPos.timestamp || Date.now()).toLocaleTimeString(),
        speed: isHistoryMode ? calculateSpeedKmH(currentIndex, historyData) : "Live",
      }
    : { lat: "-", lng: "-", time: "-", speed: "-" };

  if (!snappedRoute.length)
    return <div className="flex items-center justify-center h-screen">Loading route...</div>;

  return (
    <div className="relative h-screen w-full">
      {/* MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={INITIAL_CENTER} zoom={15} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Base route */}
          <Polyline
            positions={snappedRoute.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "gray", weight: 3, opacity: 0.5 }}
          />

          {/* Full green line (not animated) */}
          {isHistoryMode && (
            <Polyline
              positions={historyData.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#10b981", weight: 6, opacity: 0.9 }}
            />
          )}

         <AnimatedMarker
                position={[currentPos.lat, currentPos.lng]}
                info={info}
                isMoving={isPlaying}
                color={
                    isPlaying
                        ? "#10b981" // ✅ green when playing
                        : isHistoryMode
                        ? "#ef4444" // 🔴 red when paused in history
                        : "#3b82f6" // 🔵 blue in live mode
            }
            />

        </MapContainer>
      </div>

      {/* ✅ FIXED SHOW BUTTON LAYER */}
      {!isHistoryMode && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex justify-center">
          <button
            onClick={handleShow}
            className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
          >
            SHOW
          </button>
        </div>
      )}

      {/* History panel */}
      {isHistoryMode && (
        <div className="absolute top-0 left-0 right-0 z-[9999]">
          <HistoryPanel
            selectedPeriod={selectedPeriod}
            onPeriodChange={(val) => setSelectedPeriod(val)}
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying((p) => !p)}
            onReset={() => {
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
            speed={speed}
            onSpeedChange={setSpeed}
            currentIndex={currentIndex}
            totalPoints={historyData.length}
            onSeek={(i) => {
              setCurrentIndex(i);
              setIsPlaying(false);
            }}
            onExit={handleExit}
          />
        </div>
      )}
    </div>
  );
}
