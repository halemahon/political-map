let map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let infoBox = document.getElementById('info');
let municipalLayer = null;
let wardLayer = null;
let bufferedWardFeatures = [];

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

let municipalDataLoaded = false;
let wardDataLoaded = false;

function checkReadyToWatch() {
  if (municipalDataLoaded && wardDataLoaded) {
    startWatchingLocation();
  }
}

fetch('Municipal_BordersPolygon.geojson')
  .then(res => res.json())
  .then(data => {
    municipalLayer = L.geoJSON(data, {
      style: { color: 'green', weight: 2 }
    }).addTo(map);
    municipalDataLoaded = true;
    checkReadyToWatch();
  });

fetch('Municipal_Ward_BoundaryPolygon.geojson')
  .then(res => res.json())
  .then(data => {
    wardLayer = L.geoJSON(data, {
      style: { color: 'blue', weight: 2, d
