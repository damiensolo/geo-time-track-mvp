import React, { useState } from 'react';
import type { Project, ClockEvent } from '../../types';
import { PinIcon, ChevronDownIcon } from '../../components/icons';
import { useTimer } from '../../hooks/useTimer';

interface ControlCenterProps {
  project: Project;
  isClockedIn: boolean;
  clockInTime: Date | null;
  timeMultiplier: number;
  onClockToggle: () => void;
  canClockIn: boolean;
  clockLog: ClockEvent[];
}

const ControlCenter: React.FC<ControlCenterProps> = ({
  project,
  isClockedIn,
  clockInTime,
  timeMultiplier,
  onClockToggle,
  canClockIn,
  clockLog,
}) => {
  const timer = useTimer(clockInTime, isClockedIn, timeMultiplier, { showSeconds: true });
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  
  const getButtonClasses = () => {
    if (isClockedIn) {
      // A red button for clocking out, matching the user's image
      return 'bg-red-600 hover:bg-red-700';
    }
    if (canClockIn) {
      // A green button for clocking in, as per the design
      return 'bg-green-600 hover:bg-green-700';
    }
    // A disabled gray button
    return 'bg-slate-400 cursor-not-allowed';
  };

  const formatLogTime = (date: Date) => {
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden text-center">
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Shift</p>
          <p className="text-lg font-semibold text-slate-800 tracking-tight mt-1">8:00am-4:00pm</p>
        </div>

        <p className={`text-5xl font-light text-slate-800 tracking-tighter ${isClockedIn && clockInTime ? 'animate-fadeInUp' : ''}`}>
            {timer}
        </p>
        
        <button
          onClick={onClockToggle}
          className={`w-full py-4 text-white font-bold rounded-lg transition-all duration-150 ease-in-out transform active:scale-95 text-lg ${getButtonClasses()}`}
        >
          {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
        </button>
      </div>

      {isClockedIn && (
        <div className="bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => setIsLogExpanded(!isLogExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-expanded={isLogExpanded}
            aria-controls="clock-log-v4"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <PinIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <p className="text-sm text-slate-600 truncate">
                Clocked in at: {project.address}
              </p>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isLogExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <div
            id="clock-log-v4"
            className={`transition-all duration-300 ease-in-out overflow-hidden ${isLogExpanded ? 'max-h-48' : 'max-h-0'}`}
          >
            <div className="p-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-3 text-left">
                Clock In / Out Log
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {clockLog.length > 0 ? clockLog.map((event, index) => (
                  <li key={index} className="flex items-center justify-between animate-fadeInUp" style={{animationDelay: `${index * 50}ms`}}>
                    <div className="flex items-center">
                      <span className={`w-2.5 h-2.5 rounded-full mr-3 ${event.type === 'in' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{event.type === 'in' ? 'Clock In' : 'Clock Out'}</span>
                    </div>
                    <span className="font-mono">{formatLogTime(event.timestamp)}</span>
                  </li>
                )) : (
                  <li className="text-slate-500 text-center py-2">No clock events for this shift.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlCenter;