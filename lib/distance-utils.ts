/**
 * Utility functions untuk menghitung jarak geografis dan filter pasar terdekat
 */

export interface GeoLocation {
    latitude: number
    longitude: number
}

/**
 * Haversine formula untuk menghitung jarak antara dua titik geografis
 * 
 * @param lat1 Latitude titik pertama (derajat desimal)
 * @param lon1 Longitude titik pertama (derajat desimal)
 * @param lat2 Latitude titik kedua (derajat desimal)
 * @param lon2 Longitude titik kedua (derajat desimal)
 * @returns Jarak dalam kilometer
 * 
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
export function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius bumi dalam km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Jarak dalam km
    return Math.round(distance * 10) / 10; // Round ke 1 desimal
}

/**
 * Convert derajat ke radian
 */
function toRad(value: number): number {
    return (value * Math.PI) / 180;
}

/**
 * Hitung jarak dari lokasi ke lokasi lain
 */
export function calculateDistance(
    from: GeoLocation,
    to: GeoLocation
): number {
    if (!from.latitude || !from.longitude || !to.latitude || !to.longitude) {
        return Infinity;
    }
    return calculateHaversineDistance(
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude
    );
}

/**
 * Filter pasar berdasarkan radius dari lokasi tertentu
 * 
 * @param markets Daftar pasar dengan koordinat
 * @param centerLocation Lokasi pusat (lat/lon farmer)
 * @param radiusKm Radius dalam kilometer (default: 50km)
 * @returns Pasar yang berada dalam radius, sorted by distance
 */
export function filterMarketsByRadius<T extends { latitude?: number | null; longitude?: number | null }>(
    markets: T[],
    centerLocation: GeoLocation,
    radiusKm: number = 50
): (T & { distance: number })[] {
    const marketsWithDistance = markets
        .filter((market) => market.latitude && market.longitude)
        .map((market) => ({
            ...market,
            distance: calculateDistance(
                centerLocation,
                {
                    latitude: market.latitude as number,
                    longitude: market.longitude as number,
                }
            ),
        }))
        .filter((market) => market.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

    return marketsWithDistance;
}

/**
 * Cari pasar terdekat dari lokasi
 * 
 * @param markets Daftar pasar dengan koordinat
 * @param centerLocation Lokasi pusat (lat/lon farmer)
 * @returns Pasar terdekat atau undefined jika tidak ada
 */
export function findNearestMarket<T extends { latitude?: number | null; longitude?: number | null }>(
    markets: T[],
    centerLocation: GeoLocation
): (T & { distance: number }) | undefined {
    const marketsWithDistance = markets
        .filter((market) => market.latitude && market.longitude)
        .map((market) => ({
            ...market,
            distance: calculateDistance(
                centerLocation,
                {
                    latitude: market.latitude as number,
                    longitude: market.longitude as number,
                }
            ),
        }))
        .sort((a, b) => a.distance - b.distance);

    return marketsWithDistance[0];
}

/**
 * Validasi koordinat geografis
 */
export function isValidGeoLocation(location: GeoLocation): boolean {
    return (
        typeof location.latitude === 'number' &&
        typeof location.longitude === 'number' &&
        location.latitude >= -90 &&
        location.latitude <= 90 &&
        location.longitude >= -180 &&
        location.longitude <= 180
    );
}

/**
 * Format jarak untuk ditampilkan ke user
 * @param distance Jarak dalam km
 * @returns String format jarak
 */
export function formatDistance(distance: number): string {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }
    if (distance < 100) {
        return `${distance.toFixed(1)} km`;
    }
    return `${Math.round(distance)} km`;
}

/**
 * Hitung bearing (arah) dari satu titik ke titik lain
 * @returns Bearing dalam derajat (0-360) dimana 0 = Utara
 */
export function calculateBearing(
    from: GeoLocation,
    to: GeoLocation
): number {
    const dLon = toRad(to.longitude - from.longitude);
    const y = Math.sin(dLon) * Math.cos(toRad(to.latitude));
    const x =
        Math.cos(toRad(from.latitude)) * Math.sin(toRad(to.latitude)) -
        Math.sin(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.cos(dLon);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
}

/**
 * Convert bearing ke arah mata angin
 */
export function bearingToDirection(bearing: number): string {
    const directions = [
        'Utara',
        'Timur Laut',
        'Timur',
        'Tenggara',
        'Selatan',
        'Barat Daya',
        'Barat',
        'Barat Laut',
    ];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}
