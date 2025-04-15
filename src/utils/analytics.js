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

// Google Tag Manager initialization
export const initGTM = () => {
  if (!window.dataLayer) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'gtm.js', 'gtm.start': new Date().getTime() });
    console.log('Google Tag Manager initialized'); // Debugging log
  }
};

export const trackEvent = async (eventName, category, label, value) => {
  if (window.dataLayer) {
    const geoData = await fetchGeoData();
    const { city, country_name: country } = geoData;

    console.log(`Tracking event: event=${eventName}, category=${category}, label=${label}, value=${value}, city=${city}, country=${country}`);

    window.dataLayer.push({
      event: eventName,       // e.g., 'thumbnail_click'
      category: category,     // e.g., 'Carousel'
      label: label,           // e.g., '7A'
      value: value,           // e.g., '7A'
      city: city || 'Unknown',
      country: country || 'Unknown',
    });
  } else {
    console.warn('Google Tag Manager is not initialized. Event not tracked.');
  }
};
