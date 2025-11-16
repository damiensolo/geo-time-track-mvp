export interface Task {
  id: number;
  name: string;
  type: string;
}

export interface Project {
    id: number;
    name: string;
    address: string;
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface GeolocationState {
    currentLocation: Location | null;
    isInside: boolean | null;
    distance: number | null;
    error: string | null;
}

export interface ClockEvent {
    type: 'in' | 'out';
    timestamp: Date;
}