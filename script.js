// Create the map and set a temporary zoomed-out view
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let boundaryLayer = null;

// 🔎 Mayor lookup table
const mayorLookup = {
  "BARRIE": "Alex Nuttall",
  "SPRINGWATER": "Jennifer Coughlin",
  "ORO-MEDONTE": "Randy Greenlaw",
  "RAMARA": "Basil Clarke",
  "ADJALA-TOSORONTIO": "Scott Anderson",
  "SEVERN": "Mike Burkett",
  "INNISFIL": "Lynn Dollin",
  "TINY": "David Evans",
  "MIDLAND": "Bill Gordon",
  "COLLINGWOOD": "Yvonne Hamlin",
  "PENETANGUISHENE": "Dan La Rose",
  "BRADFORD WEST GWILLIMBURY": "James Leduc"
};

// Load GeoJSON file of municipal boundaries
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

// Watch user's GPS position
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
    let name = polygon.properties.Name;
    let mayor = mayorLookup[name.toUpperCase()] || "Unknown";

    if (turf.booleanPointInPolygon(point, polygon)) {
      console.log("✅ Match found:", name);
      infoBox.innerHTML = `
        You're in: <strong>${name}</strong><br>
        Mayor: <strong>${mayor}</strong>
      `;
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
