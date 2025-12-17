const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGFmaXpqdW5haWQwNiIsImEiOiJjbTQ3b2RycGMwN2xoMmlvaWNoZzFiMWp6In0.WMJxywtH3P0jB0szJCKXYg'; // 🔁 Replace with real token or load from .env

/**
 * Fetches Mapbox autocomplete (forward geocoding) suggestions.
 * @param inputText - The user's input text.
 */
export const fetchPlaceSuggestions = async (
  inputText: string,
  countryCode: string = 'in' // e.g. 'us', 'in', 'fr'
): Promise<any[]> => {
  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    inputText
  )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&autocomplete=true&limit=5&country=${countryCode}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!data.features) {
      console.warn('⚠️ Mapbox Autocomplete returned no features');
      return [];
    }

    return data.features; // Array of places
  } catch (error) {
    console.error('❌ Error fetching Mapbox suggestions:', error);
    return [];
  }
};

/**
 * Gets detailed info about a selected place.
 * (Mapbox returns full info in autocomplete, so this may not be needed)
 * But if you want to simulate details by ID (place_name), you can re-fetch it.
 */
export const fetchPlaceDetails = async (
  placeName: string,
  countryCode: string = 'in'
): Promise<any | null> => {
  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    placeName
  )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&country=${countryCode}`;

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn('⚠️ Mapbox Place Details returned no data');
      return null;
    }

    return data.features[0]; // Only one result
  } catch (error) {
    console.error('❌ Error fetching Mapbox place details:', error);
    return null;
  }
};


