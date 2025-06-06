// Start the map zoomed out; it will zoom in when your location is found
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let boundaryLayer = null;

// Load the corrected municipal boundaries
fetch('Municipal_BordersPolygon.geojson')
  .then(res => res.json())
  .then(data => {
    boundaryLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    }).addTo(map);
    console.log("✅ Municipal boundaries loaded:", data.features.length);
  })
  .catch(err => {
    console.error("❌ Failed to load boundary file:", err);
    infoBox.innerHTML = "Could not load municipal boundary data.";
  });

// Watch the user's location
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  console.log("📍 Your coordinates:", lat, lon);

  map.setView([lat, lon], 13);
  let point = turf.point([lon, lat]);

  if (!boundaryLayer) {
    console.warn("⏳ Boundary data not loaded yet.");
    return;
  }

  let found = false;

  boundaryLayer.eachLayer(layer => {
    let polygon = layer.feature;

    if (turf.booleanPointInPolygon(point, polygon)) {
      infoBox.innerHTML = "You're in: <strong>" + polygon.properties.Name + "</strong>";
      found = true;
    }
  });

  if (!found) {
    infoBox.innerHTML = "You're outside the known municipal boundaries.";
  }

}, err => {
  console.error("❌ Geolocation error:", err.message);
  infoBox.innerHTML = "Could not get your location.";
});
