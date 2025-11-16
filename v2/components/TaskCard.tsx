import React, { useState } from 'react';
import type { Task, ClockEvent } from '../../types';
import { PlayIcon, PauseIcon, ChevronDownIcon } from '../../components/icons';
import { formatTime } from '../../hooks/useTimer';

interface TaskCardProps {
  task: Task;
  isClockedIn: boolean;
  isRunning: boolean;
  elapsedSeconds: number;
  onTimerToggle: () => void;
  log: ClockEvent[];
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isClockedIn, isRunning, elapsedSeconds, onTimerToggle, log }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cardBg = isRunning ? 'bg-blue-50 border-blue-200' : 'bg-white';
  const timerColor = isRunning ? 'text-blue-600' : 'text-slate-600';
  const buttonColor = isRunning ? 'text-white bg-blue-500' : 'text-slate-500 bg-slate-200';
  const buttonHoverColor = isClockedIn ? (isRunning ? 'hover:bg-blue-600' : 'hover:bg-slate-300') : '';
  const buttonDisabledStyles = !isClockedIn ? 'opacity-50 cursor-not-allowed' : '';

  const formatLogTime = (date: Date) => {
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
  };

  return (
    <div className={`rounded-xl shadow-sm transition-all duration-200 border ${cardBg}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0 mt-1 inline-block">{task.type}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <p className={`font-mono text-lg font-semibold transition-colors ${timerColor}`}>
            {formatTime(elapsedSeconds)}
          </p>
          <button 
            onClick={onTimerToggle}
            disabled={!isClockedIn}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${buttonColor} ${buttonHoverColor} ${buttonDisabledStyles}`}
            aria-label={isRunning ? `Pause timer for ${task.name}` : `Start timer for ${task.name}`}
          >
            {isRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
           {log && log.length > 0 && (
             <button 
                onClick={() => setIsExpanded(prev => !prev)} 
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Toggle activity log"
                aria-expanded={isExpanded}
            >
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
             </button>
          )}
        </div>
      </div>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-48' : 'max-h-0'}`}
      >
        <div className="px-4 pt-1 pb-4 border-t border-slate-200">
             <h4 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-3 text-left">
                Activity Log
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {log && log.length > 0 ? log.map((event, index) => (
                  <li key={index} className="flex items-center justify-between animate-fadeInUp" style={{animationDelay: `${index * 50}ms`}}>
                    <div className="flex items-center">
                      <span className={`w-2.5 h-2.5 rounded-full mr-3 ${event.type === 'in' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{event.type === 'in' ? 'Started' : 'Stopped'}</span>
                    </div>
                    <span className="font-mono">{formatLogTime(event.timestamp)}</span>
                  </li>
                )) : (
                   <li className="text-slate-500 text-center py-2">No activity for this task.</li>
                )}
              </ul>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;