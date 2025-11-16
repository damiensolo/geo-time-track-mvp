import React from 'react';
import type { Task } from '../../types';
import { PlayIcon, PauseIcon } from '../../components/icons';
import { formatTime } from '../../hooks/useTimer';

interface TaskCardProps {
  task: Task;
  isClockedIn: boolean;
  isRunning: boolean;
  elapsedSeconds: number;
  onTimerToggle: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isClockedIn, isRunning, elapsedSeconds, onTimerToggle }) => {
  const cardBg = isRunning ? 'bg-indigo-50 border-indigo-200' : 'bg-white';
  const timerColor = isRunning ? 'text-indigo-600' : 'text-slate-600';
  const buttonColor = isRunning ? 'text-white bg-indigo-500' : 'text-slate-500 bg-slate-200';
  const buttonHoverColor = isClockedIn ? (isRunning ? 'hover:bg-indigo-600' : 'hover:bg-slate-300') : '';
  const buttonDisabledStyles = !isClockedIn ? 'opacity-50 cursor-not-allowed' : '';

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
        </div>
      </div>
    </div>
  );
};

export default TaskCard;