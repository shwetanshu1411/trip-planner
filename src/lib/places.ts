import axios from 'axios';


const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const getPlacePhoto = async (placeName: string, destination: string) => {
  if (!GOOGLE_PLACES_API_KEY) {
    // Use LoremFlickr for more relevant images based on the place name and destination
    const tags = `${placeName},${destination}`.replace(/\s+/g, ',');
    return `https://loremflickr.com/800/600/${encodeURIComponent(tags)}`;
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
      {
        params: {
          input: `${placeName} ${destination}`,
          inputtype: 'textquery',
          fields: 'photos',
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    const photoReference = response.data.candidates?.[0]?.photos?.[0]?.photo_reference;

    if (photoReference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
    }
  } catch (error) {
    console.error('Error fetching place photo:', error);
  }

  const tags = `${placeName},${destination}`.replace(/\s+/g, ',');
  return `https://loremflickr.com/800/600/${encodeURIComponent(tags)}`;
};
