const GOOGLE_MAPS_SCRIPTS = new Map();
export function estimateEtaFromMeters(distanceMeters, averageKmh = 32) {
    const hours = distanceMeters / 1000 / averageKmh;
    const minutes = Math.max(1, Math.round(hours * 60));
    return `${minutes} min`;
}
export function formatRouteSummary(distanceMeters, durationSeconds) {
    const distanceKm = (distanceMeters / 1000).toFixed(1);
    const minutes = Math.max(1, Math.round(durationSeconds / 60));
    return `${distanceKm} km • ${minutes} min`;
}
export function rankDispatchCandidates(candidates, pickup, averageKmh = 28) {
    return candidates
        .map((candidate) => {
        const distanceKm = candidate.currentDistanceMeters / 1000;
        const etaMinutes = Math.max(1, Math.round((distanceKm / averageKmh) * 60));
        const proximityScore = 1 / (1 + distanceKm);
        const availabilityScore = Math.min(1, Math.max(0, candidate.availabilityScore));
        const score = Math.round((proximityScore * 0.7 + availabilityScore * 0.3) * 100);
        return {
            rider_id: candidate.rider_id,
            score,
            estimatedMinutes: etaMinutes,
        };
    })
        .sort((a, b) => b.score - a.score);
}
export function loadGoogleMapsApi(apiKey) {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Maps can only be loaded in the browser.'));
    }
    if (!apiKey) {
        return Promise.reject(new Error('Google Maps API key is required.'));
    }
    if (GOOGLE_MAPS_SCRIPTS.has(apiKey)) {
        return GOOGLE_MAPS_SCRIPTS.get(apiKey);
    }
    const promise = new Promise((resolve, reject) => {
        if (window.google?.maps) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps script.'));
        document.head.appendChild(script);
    });
    GOOGLE_MAPS_SCRIPTS.set(apiKey, promise);
    return promise;
}
