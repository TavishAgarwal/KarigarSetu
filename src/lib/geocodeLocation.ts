/**
 * Geocoding utility using OpenStreetMap Nominatim (free, no API key required).
 * Results are in-memory cached per process to avoid repeated calls.
 */

interface Coordinates {
    lat: number;
    lon: number;
}

// In-memory cache keyed by location string
const cache = new Map<string, Coordinates | null>();

// Well-known Indian craft hub coordinates (instant lookup, no network)
const KNOWN_LOCATIONS: Record<string, Coordinates> = {
    'jaipur': { lat: 26.9124, lon: 75.7873 },
    'rajasthan': { lat: 27.0238, lon: 74.2179 },
    'lucknow': { lat: 26.8467, lon: 80.9462 },
    'uttar pradesh': { lat: 27.5706, lon: 80.0982 },
    'varanasi': { lat: 25.3176, lon: 82.9739 },
    'banaras': { lat: 25.3176, lon: 82.9739 },
    'kerala': { lat: 10.8505, lon: 76.2711 },
    'kashmir': { lat: 34.0837, lon: 74.7973 },
    'srinagar': { lat: 34.0837, lon: 74.7973 },
    'kolkata': { lat: 22.5726, lon: 88.3639 },
    'west bengal': { lat: 22.9868, lon: 87.8550 },
    'madhya pradesh': { lat: 22.9734, lon: 78.6569 },
    'gujarat': { lat: 22.2587, lon: 71.1924 },
    'ahmedabad': { lat: 23.0225, lon: 72.5714 },
    'maharashtra': { lat: 19.7515, lon: 75.7139 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'pune': { lat: 18.5204, lon: 73.8567 },
    'chennai': { lat: 13.0827, lon: 80.2707 },
    'tamil nadu': { lat: 11.1271, lon: 78.6569 },
    'bihar': { lat: 25.0961, lon: 85.3131 },
    'madhubani': { lat: 26.3567, lon: 86.0714 },
    'odisha': { lat: 20.9517, lon: 85.0985 },
    'bhubaneswar': { lat: 20.2961, lon: 85.8245 },
    'assam': { lat: 26.2006, lon: 92.9376 },
    'manipur': { lat: 24.6637, lon: 93.9063 },
    'nagaland': { lat: 26.1584, lon: 94.5624 },
    'punjab': { lat: 31.1471, lon: 75.3412 },
    'amritsar': { lat: 31.6340, lon: 74.8723 },
    'haryana': { lat: 29.0588, lon: 76.0856 },
    'delhi': { lat: 28.6139, lon: 77.2090 },
    'new delhi': { lat: 28.6139, lon: 77.2090 },
    'andhra pradesh': { lat: 15.9129, lon: 79.7400 },
    'karnataka': { lat: 15.3173, lon: 75.7139 },
    'bangalore': { lat: 12.9716, lon: 77.5946 },
    'mysore': { lat: 12.2958, lon: 76.6394 },
    'chhattisgarh': { lat: 21.2787, lon: 81.8661 },
    'bastar': { lat: 19.1143, lon: 81.9480 },
    'jharkhand': { lat: 23.6102, lon: 85.2799 },
    'himachal pradesh': { lat: 31.1048, lon: 77.1734 },
    'uttarakhand': { lat: 30.0668, lon: 79.0193 },
};

/**
 * Returns coordinates {lat, lon} for a given location string.
 * Tries known locations first, then falls back to Nominatim API.
 * Returns a fallback (center of India) if nothing works.
 */
export async function getCoordinates(location: string): Promise<Coordinates> {
    const normalized = location.toLowerCase().trim();

    // Check cache
    if (cache.has(normalized)) {
        return cache.get(normalized) ?? { lat: 20.5937, lon: 78.9629 };
    }

    // Check known locations (substring match)
    for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
        if (normalized.includes(key)) {
            cache.set(normalized, coords);
            return coords;
        }
    }

    // Try Nominatim API for unknown locations
    try {
        const encoded = encodeURIComponent(`${location}, India`);
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=in`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'KarigarSetu/1.0 (craft-map)' },
            next: { revalidate: 86400 }, // cache for 24h in Next.js
        });
        const data = await res.json();
        if (data && data.length > 0) {
            const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            cache.set(normalized, coords);
            return coords;
        }
    } catch (err) {
        console.error('[geocodeLocation] Nominatim error:', err);
    }

    // Fallback: center of India
    const fallback = { lat: 20.5937, lon: 78.9629 };
    cache.set(normalized, fallback);
    return fallback;
}
