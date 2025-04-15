let geoDataCache = null; // Cache for geolocation data

// Function to fetch geolocation data
const fetchGeoData = async () => {
  if (!geoDataCache) {
    try {
      const response = await fetch('https://ipapi.co/json/');
      geoDataCache = await response.json();
      console.log('Geolocation data fetched:', geoDataCache); // Debugging log
    } catch (error) {
      console.warn('Failed to fetch geolocation data:', error);
      geoDataCache = { city: 'Unknown', country_name: 'Unknown' }; // Fallback data
    }
  }
  return geoDataCache;
};

// Google Analytics initialization
export const initGA = () => {
  if (!window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-2G2CDLZCH8';
    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-2G2CDLZCH8');
      console.log('Google Analytics initialized with ID: G-2G2CDLZCH8'); // Debugging log
    };
  }
};

// Function to track events with geolocation data
export const trackEvent = async (action, category, label, value) => {
  if (window.gtag) {
    const geoData = await fetchGeoData();
    const { city, country_name: country } = geoData;

    console.log(`Tracking event: action=${action}, category=${category}, label=${label}, value=${value}, city=${city}, country=${country}`); // Debugging log

    // Send event with geolocation data
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      city: city || 'Unknown',
      country: country || 'Unknown',
    });
  } else {
    console.warn('Google Analytics is not initialized. Event not tracked.'); // Debugging log
  }
};
