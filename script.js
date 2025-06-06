let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let boundaryLayer = null;

// Load your municipal boundary file
fetch('Municipal_BordersPolygon.json')
  .then(res => res.json())
  .then(data => {
    boundaryLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    }).addTo(map);
    console.log("✅ Municipal boundaries loaded.");
  })
  .catch(err => {
    console.error("❌ Failed to load municipal boundaries:", err);
    infoBox.innerHTML = "Failed to load boundary data.";
  });

// Watch the user's location
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  console.log("📍 Your location:", lat, lon);
  map.setView([lat, lon], 13);

  let point = turf.point([lon, lat]);
  let found = false;

  if (boundaryLayer) {
    boundaryLayer.eachLayer(layer => {
      let polygon = layer.feature;
      if (turf.booleanPointInPolygon(point, polygon)) {
        infoBox.innerHTML = "You're in: <strong>" + polygon.properties.Name + "</strong>";
        found = true;
      }
    });
  } else {
    console.warn("⏳ Boundary data not loaded yet.");
  }

  if (!found && boundaryLayer) {
    infoBox.innerHTML = "You're outside the known municipal boundaries.";
  }

}, err => {
  infoBox.innerHTML = "Could not get your location.";
});
