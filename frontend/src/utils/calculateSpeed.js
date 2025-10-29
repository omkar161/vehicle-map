export function calculateSpeedKmH(currentIndex, routeData) {
  if (currentIndex === 0 || routeData.length <= 1) return '0.00';

  const curr = routeData[currentIndex];
  const prev = routeData[currentIndex - 1];

  const R = 6371000;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(curr.lat - prev.lat);
  const dLon = toRad(curr.lng - prev.lng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(prev.lat)) * Math.cos(toRad(curr.lat)) * Math.sin(dLon/2)**2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const timeDiff = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 3600000;
  if (timeDiff <= 0) return '0.00';

  return (distance / 1000 / timeDiff).toFixed(2);
}