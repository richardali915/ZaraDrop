import { writable } from 'svelte/store';
import { loadGoogleMapsApi, estimateEtaFromMeters, formatRouteSummary } from '@zaradrop/lib';
import type { LocationPoint, RouteSummary } from '@zaradrop/types';

export const routeSummary = writable<RouteSummary | null>(null);
export const routeLoading = writable(false);
export const routeError = writable<string | null>(null);

export type MapTravelMode = 'DRIVING' | 'BICYCLING' | 'WALKING' | 'TRANSIT';

const isBrowser = typeof window !== 'undefined';

async function geocodeAddress(address: string, apiKey: string): Promise<LocationPoint> {
  if (!isBrowser) {
    throw new Error('Geocoding requires a browser environment.');
  }

  if (!apiKey) {
    throw new Error('Google Maps API key is required for geocoding.');
  }

  await loadGoogleMapsApi(apiKey);

  return new Promise((resolve, reject) => {
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any, status: string) => {
      if (status !== 'OK' || !results || !results.length) {
        reject(new Error(`Unable to resolve address: ${address}`));
        return;
      }

      const place = results[0];
      const location = place.geometry.location;

      resolve({
        lat: location.lat(),
        lng: location.lng(),
        label: place.formatted_address,
        description: place.formatted_address,
      });
    });
  });
}

async function reverseGeocodePoint(lat: number, lng: number, apiKey: string): Promise<LocationPoint> {
  if (!isBrowser) {
    throw new Error('Reverse geocoding requires a browser environment.');
  }

  if (!apiKey) {
    throw new Error('Google Maps API key is required for reverse geocoding.');
  }

  await loadGoogleMapsApi(apiKey);

  return new Promise((resolve, reject) => {
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
      if (status !== 'OK' || !results || !results.length) {
        reject(new Error(`Unable to resolve coordinates: ${lat}, ${lng}`));
        return;
      }

      const place = results[0];
      resolve({
        lat,
        lng,
        label: place.formatted_address,
        description: place.formatted_address,
      });
    });
  });
}

async function resolvePoint(value: LocationPoint | string, apiKey: string): Promise<LocationPoint> {
  if (typeof value === 'string') {
    return geocodeAddress(value, apiKey);
  }

  if (typeof value.lat === 'number' && typeof value.lng === 'number') {
    return value;
  }

  throw new Error('Invalid route point value.');
}

export interface RouteMapOptions {
  apiKey: string;
  mapElement: HTMLDivElement;
  origin: LocationPoint | string;
  destination: LocationPoint | string;
  travelMode?: MapTravelMode;
  waypoints?: Array<LocationPoint | string>;
}

export async function buildRouteMap(options: RouteMapOptions): Promise<RouteSummary> {
  const { apiKey, mapElement, origin, destination, travelMode = 'DRIVING', waypoints = [] } = options;

  if (!isBrowser) {
    throw new Error('Route rendering must run in the browser.');
  }

  if (!apiKey) {
    throw new Error('Google Maps API key is required.');
  }

  if (!mapElement) {
    throw new Error('Map container element is required.');
  }

  routeLoading.set(true);
  routeError.set(null);

  try {
    await loadGoogleMapsApi(apiKey);

    const originPoint = await resolvePoint(origin, apiKey);
    const destinationPoint = await resolvePoint(destination, apiKey);
    const waypointPoints = await Promise.all(
      waypoints.map((point) => resolvePoint(point, apiKey)),
    );

    const map = new (window as any).google.maps.Map(mapElement, {
      center: { lat: originPoint.lat, lng: originPoint.lng },
      zoom: 13,
      mapTypeId: 'roadmap',
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [{ color: '#0f172a' }],
        },
      ],
    });

    const renderer = new (window as any).google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#8b5cf6',
        strokeWeight: 5,
      },
    });

    const service = new (window as any).google.maps.DirectionsService();
    const directionsRequest = {
      origin: { lat: originPoint.lat, lng: originPoint.lng },
      destination: { lat: destinationPoint.lat, lng: destinationPoint.lng },
      travelMode,
      waypoints: waypointPoints.map((point) => ({ location: { lat: point.lat, lng: point.lng }, stopover: true })),
      optimizeWaypoints: false,
    };

    const response = await new Promise<any>((resolve, reject) => {
      service.route(directionsRequest, (result: any, status: string) => {
        if (status !== 'OK' || !result) {
          reject(new Error(`Route lookup failed with status ${status}.`));
          return;
        }
        resolve(result);
      });
    });

    renderer.setDirections(response);

    const route = response.routes?.[0];
    const legs = route?.legs ?? [];
    const totalDistance = legs.reduce((sum: number, leg: any) => sum + (leg.distance?.value ?? 0), 0);
    const totalDuration = legs.reduce((sum: number, leg: any) => sum + (leg.duration?.value ?? 0), 0);
    const summary: RouteSummary = {
      distanceMeters: totalDistance,
      durationSeconds: totalDuration,
      etaText: estimateEtaFromMeters(totalDistance),
      routeSummary: formatRouteSummary(totalDistance, totalDuration),
    };

    routeSummary.set(summary);
    return summary;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to build route map.';
    routeError.set(message);
    throw error;
  } finally {
    routeLoading.set(false);
  }
}
