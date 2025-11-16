import { useState, useEffect } from 'react';

export const formatTime = (totalSeconds: number, options?: { showSeconds?: boolean }): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (options?.showSeconds) {
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours.toString()}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${hours.toString()}:${pad(minutes)}`;
};

export const useTimer = (
    startTime: Date | null, 
    isRunning: boolean, 
    timeMultiplier: number, 
    options?: { showSeconds?: boolean }
): string => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // If the timer isn't running or doesn't have a start time, we shouldn't tick.
    if (!isRunning || !startTime) {
      // Explicitly reset the timer to zero only when the start time is cleared (e.g., on clock-out).
      // This prevents the timer from resetting on a temporary pause.
      if (!startTime) {
        setElapsedSeconds(0);
      }
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const difference = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(difference);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const simulatedSeconds = elapsedSeconds * timeMultiplier;

  return formatTime(simulatedSeconds, options);
};