// Initialize the map
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let municipalLayer = null;
let wardLayer = null;

// Mayor lookup table
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

// Load municipal boundaries
fetch('Municipal_BordersPolygon.geojson')
  .then(res => res.json())
  .then(data => {
    municipalLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    }).addTo(map);
    console.log("✅ Municipal boundaries loaded");
  });

// Load ward boundaries
fetch('Municipal_Ward_BoundaryPolygon.json')
  .then(res => res.json())
  .then(data => {
    wardLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2, dashArray: '4' }
    }).addTo(map);
    console.log("✅ Ward boundaries loaded");
  });

// Watch GPS position
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  map.setView([lat, lon], 13);

  const point = turf.point([lon, lat]);

  let municipality = "Unknown";
  let mayor = "Unknown";
  let ward = "Unknown";

  // Check municipal match
  if (municipalLayer) {
    municipalLayer.eachLayer(layer => {
      const name = layer.feature.properties.Name;
      if (turf.booleanPointInPolygon(point, layer.feature)) {
        municipality = name.charAt(0) + name.slice(1).toLowerCase();
        const mayorRaw = mayorLookup[name.toUpperCase()] || "Unknown";
        mayor = mayorRaw.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
      }
    });
  }

  // Check ward match
  if (wardLayer) {
    wardLayer.eachLayer(layer => {
      const wardName = layer.feature.properties.Ward;
      if (turf.booleanPointInPolygon(point, layer.feature)) {
        ward = wardName;
      }
    });
  }

  // Show result
  if (municipality === "Unknown") {
    infoBox.innerHTML = "You're outside the known municipal boundaries.";
  } else {
    infoBox.innerHTML =
      `<strong>Municipality:</strong> ${municipality}\n` +
      `<strong>Mayor:</strong> ${mayor}\n` +
      `<strong>Ward:</strong> ${ward}`;
  }

}, err => {
  console.error("❌ Geolocation error:", err.message);
  infoBox.innerHTML = "Could not get your location.";
});
