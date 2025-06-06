// Initialize the map
let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
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

// Councillor lookup table
const councillorLookup = {
  "BARRIE": {
    "1": "Clare Riepma", "2": "Craig Nixon", "3": "Ann-Marie Kungl",
    "4": "Amy Courser", "5": "Robert Thomson", "6": "Nigussie Nigussie",
    "7": "Gary Harvey", "8": "Jim Harris", "9": "Sergio Morales", "10": "Bryn Hamilton"
  },
  "SPRINGWATER": {
    "1": "Matt Garwood", "2": "Danielle Alexander", "3": "Brad Thompson",
    "4": "Anita Moore", "5": "Phil Fisher"
  },
  "ORO-MEDONTE": {
    "1": "Lori Hutcheson", "2": "John Bard", "3": "David Clark",
    "4": "Peter Lavoie", "5": "Rick Schell", "6": "Bob Young"
  }
};

// Load municipal boundaries
fetch('Municipal_BordersPolygon.geojson')
  .then(res => res.json())
  .then(data => {
    municipalLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    }).addTo(map);
  });

// Load ward boundaries (updated file name)
fetch('Municipal_Ward_BoundaryPolygon.geojson')
  .then(res => res.json())
  .then(data => {
    wardLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2, dashArray: '4' }
    }).addTo(map);
  });

// Track user location
navigator.geolocation.watchPosition(pos => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  map.setView([lat, lon], 13);
  const point = turf.point([lon, lat]);

  let municipality = "Unknown";
  let mayor = "Unknown";
  let ward = "Unknown";
  let councillor = "Unknown";

  // Find matching municipality
  if (municipalLayer) {
    municipalLayer.eachLayer(layer => {
      const name = layer.feature.properties.Name;
      if (turf.booleanPointInPolygon(point, layer.feature)) {
        municipality = name.charAt(0) + name.slice(1).toLowerCase();
        const rawMayor = mayorLookup[name.toUpperCase()] || "Unknown";
        mayor = rawMayor.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
      }
    });
  }

  // Find matching ward
  if (wardLayer) {
    wardLayer.eachLayer(layer => {
      const rawWard = layer.feature.properties.Ward;
      if (turf.booleanPointInPolygon(point, layer.feature)) {
        // Extract just the number (e.g., from "Ward 2")
        const wardNum = (rawWard || "").replace(/\D/g, "");
        ward = wardNum;

        const munKey = municipality.toUpperCase();
        if (councillorLookup[munKey] && councillorLookup[munKey][wardNum]) {
          councillor = councillorLookup[munKey][wardNum];
        }
      }
    });
  }

  // Display result
  if (municipality === "Unknown") {
    infoBox.innerHTML = "You're outside the known municipal boundaries.";
  } else {
    infoBox.innerHTML =
      `<strong>Municipality:</strong> ${municipality}\n` +
      `<strong>Mayor:</strong> ${mayor}\n` +
      `<strong>Ward:</strong> ${ward}\n` +
      `<strong>Councillor:</strong> ${councillor}`;
  }

}, err => {
  console.error("❌ Geolocation error:", err.message);
  infoBox.innerHTML = "Could not get your location.";
});
