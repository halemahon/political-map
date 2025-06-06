// Start the map zoomed out; we'll zoom in after getting location
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let boundaryLayer;

// Load your actual federal ridings file (GeoJSON format, even if named .json)
fetch('federal_ridings.json')
  .then(res => res.json())
  .then(data => {
    boundaryLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 1 }
    }).addTo(map);
  });

// Track the user's location and update the view/info
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  // Center and zoom in on user's location
  map.setView([lat, lon], 13);

  let point = turf.point([lon, lat]);
  let found = false;

  boundaryLayer.eachLayer(layer => {
    let polygon = layer.feature;
    if (turf.booleanPointInPolygon(point, polygon)) {
      // Use the EDNAME field for riding name (standard in Elections Canada data)
      infoBox.innerHTML = "You're in: <strong>" + polygon.properties.EDNAME + "</strong>";
      found = true;
    }
  });

  if (!found) {
    infoBox.innerHTML = "You're outside any riding area.";
  }

}, err => {
  infoBox.innerHTML = "Could not get your location.";
});
