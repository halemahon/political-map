// Start zoomed out; zoom in once GPS is found
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let boundaryLayer;

// Load your county's municipal boundary file
fetch('Municipal_BordersPolygon.json')
  .then(res => res.json())
  .then(data => {
    boundaryLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    }).addTo(map);
  });

// Get and watch user's location
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  map.setView([lat, lon], 13); // Zoom to user's location

  let point = turf.point([lon, lat]);
  let found = false;

  boundaryLayer.eachLayer(layer => {
    let polygon = layer.feature;

    if (turf.booleanPointInPolygon(point, polygon)) {
      // Use the exact property name you confirmed: "Name"
      infoBox.innerHTML = "You're in: <strong>" + polygon.properties.Name + "</strong>";
      found = true;
    }
  });

  if (!found) {
    infoBox.innerHTML = "You're outside the known municipal boundaries.";
  }

}, err => {
  infoBox.innerHTML = "Could not get your location.";
});

