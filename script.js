// Start map zoomed out; will zoom in once location is found
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let boundaryLayer = null; // We'll set this once the data loads

// Load your municipal boundary file
fetch('Municipal_BordersPolygon.json')
  .then(res => res.json())
  .then(data => {
    boundaryLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    }).addTo(map);
    console.log("Municipal boundaries loaded:", data.features.length, "features");
  })
  .catch(err => {
    console.error("Failed to load municipal boundaries:", err);
    infoBox.innerHTML = "Failed to load boundary data.";
  });

// Watch the user's location
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  console.log("Your coordinates:", lat, lon);

  // Zoom to user's location
  map.setView([lat, lon], 13);

  let point = turf.point([lon, lat]);
  let found = false;

  if (boundaryLayer && boundaryLayer.eachLayer) {
    boundaryLayer.eachLayer(layer => {
      let polygon = layer.feature;

      if (turf.booleanPointInPolygon(point, polygon)) {
        // Display the municipality name from the "Name" field
        infoBox.innerHTML = "You're in: <strong>" + polygon.properties.Name + "</strong>";
        found = true;
      }
    });
  }

  if (!found) {
    infoBox.innerHTML = "You're outside the known municipal boundaries.";
  }

}, err => {
  infoBox.innerHTML = "Could not get your location.";
});
