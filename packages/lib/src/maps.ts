import type { LocationPoint, RouteSummary, DispatchCandidate, DispatchScore } from '@zaradrop/types';

const GOOGLE_MAPS_SCRIPTS = new Map<string, Promise<void>>();

export function estimateEtaFromMeters(distanceMeters: number, averageKmh = 32): string {
  const hours = distanceMeters / 1000 / averageKmh;
  const minutes = Math.max(1, Math.round(hours * 60));
  return `${minutes} min`;
}

export function formatRouteSummary(distanceMeters: number, durationSeconds: number): string {
  const distanceKm = (distanceMeters / 1000).toFixed(1);
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${distanceKm} km • ${minutes} min`;
}

export function rankDispatchCandidates(
  candidates: DispatchCandidate[],
  pickup: LocationPoint,
  averageKmh = 28,
): DispatchScore[] {
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

export function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded in the browser.'));
  }

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is required.'));
  }

  if (GOOGLE_MAPS_SCRIPTS.has(apiKey)) {
    return GOOGLE_MAPS_SCRIPTS.get(apiKey)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    if ((window as any).google?.maps) {
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
