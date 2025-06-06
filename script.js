let map = L.map('map').setView([45.4215, -75.6972], 12); // Default: Ottawa

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let boundaryLayer;

// Load sample GeoJSON
fetch('sample.geojson')
  .then(res => res.json())
  .then(data => {
    boundaryLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2 }
    }).addTo(map);
  });

// Watch user's location
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  map.setView([lat, lon]);

  let point = turf.point([lon, lat]);

  let found = false;

  boundaryLayer.eachLayer(layer => {
    let polygon = layer.feature;
    if (turf.booleanPointInPolygon(point, polygon)) {
      infoBox.innerHTML = "You're in: <strong>" + polygon.properties.name + "</strong>";
      found = true;
    }
  });

  if (!found) {
    infoBox.innerHTML = "You're outside the test area.";
  }

}, err => {
  infoBox.innerHTML = "Could not get your location.";
});
