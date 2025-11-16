
import { useState, useEffect } from 'react';
import type { Location, GeolocationState } from '../types';

// Haversine formula to calculate distance between two lat/lng points
const getDistance = (from: Location, to: Location): number => {
  const R = 6371e3; // metres
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const useGeolocation = (
  targetLocation: Location,
  radius: number,
  overrideLocation?: Location | null
): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    currentLocation: null,
    isInside: null,
    distance: null,
    error: null,
  });

  useEffect(() => {
    if (overrideLocation) {
      const distance = getDistance(overrideLocation, targetLocation);
      const isInside = distance <= radius;
      setState({
        currentLocation: overrideLocation,
        isInside,
        distance,
        error: null,
      });
      return; // Do not use browser geolocation if override is active
    }

    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    const success = (position: GeolocationPosition) => {
      const currentLocation: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const distance = getDistance(currentLocation, targetLocation);
      const isInside = distance <= radius;

      setState({
        currentLocation,
        isInside,
        distance,
        error: null,
      });
    };

    const error = () => {
      setState(s => ({ ...s, error: 'Unable to retrieve your location.' }));
    };
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const watcher = navigator.geolocation.watchPosition(success, error, options);

    return () => navigator.geolocation.clearWatch(watcher);
  }, [targetLocation, radius, overrideLocation]);

  return state;
};