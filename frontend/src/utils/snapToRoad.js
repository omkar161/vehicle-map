export async function snapRouteToRoad(points) {
  if (points.length < 2) return points;

  const coordinates = points.map(p => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    }
  } catch (err) {
    console.warn("OSRM failed, using raw path:", err);
  }
  return points;
}
