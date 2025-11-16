import React, { useState, useEffect, useCallback, useRef } from 'react';
import TaskList from '../components/TaskList';
import ControlCenter from '../components/ControlCenter';
import { useGeolocation } from '../hooks/useGeolocation';
import { TARGET_LOCATION, GEOFENCE_RADIUS_METERS } from '../constants';
import type { GeolocationState, Project, Location, ClockEvent } from '../types';
import { useDragToScroll } from '../hooks/useDragToScroll';

interface TaskTimerScreenProps {
  project: Project;
  isGeofenceOverridden: boolean;
  timeMultiplier: number;
  simulatedDistance: number;
  onShiftEnd: (totalSeconds: number) => void;
  showMap: boolean;
}

const SHIFT_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

const TaskTimerScreen: React.FC<TaskTimerScreenProps> = ({ project, isGeofenceOverridden, timeMultiplier, simulatedDistance, onShiftEnd, showMap }) => {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [simulatedLocation, setSimulatedLocation] = useState<Location | null>(null);
  const [showAutoClockOutBanner, setShowAutoClockOutBanner] = useState(false);
  const [clockLog, setClockLog] = useState<ClockEvent[]>([]);
  const scrollRef = useRef<HTMLElement>(null);
  useDragToScroll(scrollRef);
  
  // Calculate a simulated location based on the distance from the testing slider
  useEffect(() => {
    // 1 degree of latitude is approximately 111.1km
    const latitudeOffset = simulatedDistance / 111100;
    
    const newLocation: Location = {
      latitude: TARGET_LOCATION.latitude + latitudeOffset,
      longitude: TARGET_LOCATION.longitude,
    };
    setSimulatedLocation(newLocation);
  }, [simulatedDistance]);

  const locationState: GeolocationState = useGeolocation(TARGET_LOCATION, GEOFENCE_RADIUS_METERS, simulatedLocation);

  const effectiveIsInside = locationState.isInside || isGeofenceOverridden;

  const handleClockToggle = useCallback(() => {
    setIsClockedIn(prev => {
      if (!prev) {
        // Clocking IN
        if (!effectiveIsInside) return false; // Guard against clocking in while outside
        setClockInTime(new Date());
        setClockLog(log => [...log, { type: 'in', timestamp: new Date() }]);
        return true;
      } else {
        // Clocking OUT
        setClockLog(log => [...log, { type: 'out', timestamp: new Date() }]);
        if (clockInTime) {
          const durationSeconds = Math.floor((new Date().getTime() - clockInTime.getTime()) / 1000);
          let simulatedDuration = durationSeconds * timeMultiplier;
          
          // Cap the total time at the maximum shift duration
          simulatedDuration = Math.min(simulatedDuration, SHIFT_DURATION_SECONDS);

          // Round to the nearest minute to ensure allocation logic matches display.
          const totalMinutes = Math.round(simulatedDuration / 60);
          onShiftEnd(totalMinutes * 60);
        }
        setClockInTime(null);
        return false;
      }
    });
  }, [effectiveIsInside, clockInTime, timeMultiplier, onShiftEnd]);

  useEffect(() => {
    // Automatically clock out if user leaves the geofence
    if (isClockedIn && !effectiveIsInside) {
        handleClockToggle();
        setShowAutoClockOutBanner(true);
        const timer = setTimeout(() => setShowAutoClockOutBanner(false), 5000);
        return () => clearTimeout(timer);
    }
  }, [isClockedIn, effectiveIsInside, handleClockToggle]);

  useEffect(() => {
    // Automatically clock out after 8-hour shift is complete
    if (!isClockedIn || !clockInTime) {
      return;
    }

    const checkTime = () => {
      const elapsedSeconds = ((new Date().getTime() - clockInTime.getTime()) / 1000) * timeMultiplier;
      if (elapsedSeconds >= SHIFT_DURATION_SECONDS) {
        handleClockToggle();
      }
    };
    
    const intervalId = setInterval(checkTime, 1000);

    return () => clearInterval(intervalId);
  }, [isClockedIn, clockInTime, timeMultiplier, handleClockToggle]);

  return (
    <div className="flex flex-col h-full">
      <main ref={scrollRef} className="flex-grow px-4 pt-3 pb-4 space-y-6 overflow-y-auto no-scrollbar relative">
          
          {showAutoClockOutBanner && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md animate-fadeIn shadow-lg absolute top-0 left-4 right-4 z-10" role="alert">
                  <p className="font-bold">Auto Clock-Out</p>
                  <p>You have been automatically clocked out for leaving the job site.</p>
              </div>
          )}

          {!isClockedIn && !effectiveIsInside && locationState.isInside !== null && !showAutoClockOutBanner && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md animate-fadeIn" role="alert">
                  <p>You must be inside the job site to clock in.</p>
              </div>
          )}

          <ControlCenter
            targetLocation={TARGET_LOCATION}
            radius={GEOFENCE_RADIUS_METERS}
            currentLocation={locationState.currentLocation}
            isInside={locationState.isInside}
            distance={locationState.distance}
            error={locationState.error}
            isGeofenceOverridden={isGeofenceOverridden}
            isClockedIn={isClockedIn}
            onClockToggle={handleClockToggle}
            canClockIn={effectiveIsInside}
            showMap={showMap}
            project={project}
            clockLog={clockLog}
          />
        
        <h2 className="text-slate-800 font-bold text-xl pt-2">Today's tasks</h2>
        <TaskList />
      </main>
    </div>
  );
};

export default TaskTimerScreen;