import React from 'react';
import { useTimer } from '../hooks/useTimer';

interface TotalHoursCardProps {
  isClockedIn: boolean;
  clockInTime: Date | null;
  onClockToggle: () => void;
  timeMultiplier: number;
  canClockIn: boolean;
}

const TotalHoursCard: React.FC<TotalHoursCardProps> = ({ isClockedIn, clockInTime, onClockToggle, timeMultiplier, canClockIn }) => {
  const timer = useTimer(clockInTime, isClockedIn, timeMultiplier, { showSeconds: true });

  const formattedClockInTime = clockInTime 
    ? clockInTime.toLocaleString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    : '';

  const getButtonClasses = () => {
    if (isClockedIn) {
      return 'bg-red-500 hover:bg-red-600';
    }
    if (canClockIn) {
      return 'bg-green-600 hover:bg-green-700';
    }
    return 'bg-slate-400 cursor-not-allowed';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center space-y-4">
      <div>
        <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Total Hours</h2>
        <p className="text-5xl font-light text-slate-800 tracking-tighter mt-1">{timer}</p>
      </div>
      
      {isClockedIn && clockInTime && (
          <p className="text-sm text-slate-500 !mt-2">Clock started at {formattedClockInTime}</p>
      )}

      <button
        onClick={onClockToggle}
        className={`w-full py-4 text-white font-bold rounded-lg transition-colors text-lg ${getButtonClasses()}`}
      >
        {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
      </button>
    </div>
  );
};

export default TotalHoursCard;