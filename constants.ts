import type { Task, Location, Project } from './types';

export const TASKS: Task[] = [
  { id: 1, name: 'Module Cleaning', type: 'T&M' },
  { id: 2, name: 'Site Preparation', type: 'PL' },
  { id: 3, name: 'Excavation', type: 'ST' },
  { id: 4, name: 'Foundation', type: 'ST' },
];

export const PROJECTS: Project[] = [
    { id: 1, name: 'Ev Charging Station', address: '11, Murugesan Street, Chetpet, Chennai' },
    { id: 2, name: 'Solar Panel Installation', address: '45, Main Road, Velachery, Chennai' },
    { id: 3, name: 'Wind Turbine Maintenance', address: '78, Beach Road, Besant Nagar, Chennai' },
];


// Example: Downtown San Francisco
export const TARGET_LOCATION: Location = {
  latitude: 37.7749,
  longitude: -122.4194,
};

export const GEOFENCE_RADIUS_METERS = 500; // 500 meters