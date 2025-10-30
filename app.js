let map;
let currentCountryCode = null;
let homeCountryCode = localStorage.getItem('homeCountry') || 'US';

// Emergency numbers by country (ISO 3166-1 alpha-2)
const emergencyNumbers = {
  TH: { police: '191', ambulance: '1669', fire: '199' },
  PT: { police: '112', ambulance: '112', fire: '112' },
  MX: { police: '911', ambulance: '911', fire: '911' },
  US: { police: '911', ambulance: '911', fire: '911' },
  DE: { police: '110', ambulance: '112', fire: '112' },
  FR: { police: '17', ambulance: '15', fire: '18', universal: '112' },
  // Add more as needed
};

// Home country flags (emoji by ISO code)
const countryFlags = {
  US: '🇺🇸', TH: '🇹🇭', PT: '🇵🇹', MX: '🇲🇽', DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺'
};

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 14,
          center: userLocation,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
            { elementType: "labels.icon", stylers: [{ visibility: "off" }] }
          ]
        });

        // Reverse geocode to get country
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: userLocation }, (results, status) => {
          if (status === "OK" && results[0]) {
            const country = results[0].address_components.find(comp => 
              comp.types.includes("country")
            );
            if (country) {
              currentCountryCode = country.short_name;
              updateUI();
              loadPlaces();
            }
          }
        });

        // Add user marker
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here"
        });
      },
      () => {
        // Fallback to Lisbon if geolocation fails
        const fallback = { lat: 38.7223, lng: -9.1393 };
        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 12,
          center: fallback
        });
        currentCountryCode = 'PT';
        updateUI();
        loadPlaces();
      }
    );
  }
}

function updateUI() {
  const localTimeEl = document.getElementById('local-time');
  const homeTimeEl = document.getElementById('home-time');
  
  const now = new Date();
  const localTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const homeTime = new Date(now.toLocaleString("en-US", { timeZone: getTZ(homeCountryCode) }))
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const localFlag = countryFlags[currentCountryCode] || '📍';
  const homeFlag = countryFlags[homeCountryCode] || '🏠';
  
  localTimeEl.textContent = `${localFlag} ${localTime}`;
  homeTimeEl.textContent = `${homeFlag} ${homeTime} • Tap to change`;
  
  homeTimeEl.onclick = () => chooseHomeCountry();
}

function getTZ(countryCode) {
  const tzMap = {
    US: 'America/New_York',
    GB: 'Europe/London',
    TH: 'Asia/Bangkok',
    PT: 'Europe/Lisbon',
    MX: 'America/Mexico_City',
    DE: 'Europe/Berlin',
    FR: 'Europe/Paris',
    CA: 'America/Toronto',
    AU: 'Australia/Sydney'
  };
  return tzMap[countryCode] || 'UTC';
}

function chooseHomeCountry() {
  const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'PT', 'MX', 'TH'];
  let list = 'Choose home country:\n';
  countries.forEach(code => {
    list += `\n${countryFlags[code]} ${code}`;
  });
  const choice = prompt(list, homeCountryCode);
  if (choice && countries.includes(choice.toUpperCase())) {
    homeCountryCode = choice.toUpperCase();
    localStorage.setItem('homeCountry', homeCountryCode);
    updateUI();
  }
}

function loadPlaces() {
  if (!map || !currentCountryCode) return;

  const request = {
    location: map.getCenter(),
    radius: 5000,
    type: ['hospital', 'pharmacy', 'grocery_or_supermarket', 'restaurant', 'electronics_store']
  };

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.forEach(place => {
        new google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name
        });
      });
    }
  });
}

// Initialize when page loads
window.onload = initMap;

// Filter buttons (basic for now)
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    btn.classList.add('active');
    // Full filtering logic comes in next step
  });
});
