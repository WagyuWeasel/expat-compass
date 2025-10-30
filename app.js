let map;
let markers = [];
let currentCountryCode = null;
let homeCountryCode = localStorage.getItem('homeCountry') || 'US';

const emergencyNumbers = {
  TH: { police: '191', ambulance: '1669' },
  PT: { police: '112', ambulance: '112' },
  MX: { police: '911', ambulance: '911' },
  US: { police: '911', ambulance: '911' },
  DE: { police: '110', ambulance: '112' },
  FR: { police: '17', ambulance: '15' },
  GB: { police: '999', ambulance: '999' }
};

const countryFlags = {
  US: '🇺🇸', TH: '🇹🇭', PT: '🇵🇹', MX: '🇲🇽', DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺'
};

const tzMap = {
  US: 'America/New_York', GB: 'Europe/London', TH: 'Asia/Bangkok',
  PT: 'Europe/Lisbon', MX: 'America/Mexico_City', DE: 'Europe/Berlin',
  FR: 'Europe/Paris', CA: 'America/Toronto', AU: 'Australia/Sydney'
};

function initMap() {
  const fallback = { lat: 38.7223, lng: -9.1393 };
  const center = fallback;

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: center,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER }
  });

  loadPlaces(center);
  updateUI();
}

function updateUI() {
  const now = new Date();
  const localTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const homeTime = new Date(now.toLocaleString("en-US", { timeZone: tzMap[homeCountryCode] || 'UTC' }))
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const localFlag = countryFlags[currentCountryCode] || '📍';
  const homeFlag = countryFlags[homeCountryCode] || '🏠';

  document.getElementById('local-time').textContent = `${localFlag} ${localTime}`;
  document.getElementById('home-time').textContent = `${homeFlag} ${homeTime}`;
  document.getElementById('home-time').onclick = chooseHomeCountry;
}

function chooseHomeCountry() {
  const choice = prompt('Enter home country code (e.g. US, GB, TH):', homeCountryCode);
  if (choice && countryFlags[choice.toUpperCase()]) {
    homeCountryCode = choice.toUpperCase();
    localStorage.setItem('homeCountry', homeCountryCode);
    updateUI();
  }
}

function loadPlaces(center) {
  clearMarkers();

  const typesMap = {
    help: ['hospital', 'pharmacy', 'police'],
    daily: ['grocery_or_supermarket', 'convenience_store', 'laundry'],
    connect: ['electronics_store', 'mobile_phone_store'],
    eat: ['restaurant', 'cafe'],
    explore: ['park', 'museum', 'tourist_attraction']
  };

  const allTypes = [...new Set(Object.values(typesMap).flat())];
  const service = new google.maps.places.PlacesService(map);

  allTypes.forEach(type => {
    const request = { location: center, radius: 8000, type };
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach(place => {
          const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name
          });
          markers.push(marker);
        });
      }
    });
  });
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    btn.classList.add('active');
    // Full filtering logic can be added later
  });
});

window.onload = initMap;
