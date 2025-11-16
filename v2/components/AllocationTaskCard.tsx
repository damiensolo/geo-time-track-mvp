import React, { useState } from 'react';
import type { Task } from '../../types';
import { formatTime } from '../../hooks/useTimer';
import { ClockIcon, ChatBubbleIcon, ChevronDownIcon } from '../../components/icons';

interface TimeInputProps {
  label: string;
  totalSeconds: number;
  onTimeChange: (newHours: number, newMinutes: number) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ label, totalSeconds, onTimeChange }) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHours = parseInt(e.target.value, 10);
    if (isNaN(newHours) || newHours < 0) newHours = 0;
    onTimeChange(newHours, minutes);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinutes = parseInt(e.target.value, 10);
    if (isNaN(newMinutes) || newMinutes < 0) {
        newMinutes = 0;
    } else if (newMinutes > 59) {
        newMinutes = 59;
    }
    onTimeChange(hours, newMinutes);
  };

  return (
    <div className="flex items-center justify-between">
      <label htmlFor={`${label}-${hours}-${minutes}`} className="text-sm font-medium text-slate-600">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            id={`${label}-${hours}-${minutes}-hours`}
            type="number"
            value={hours.toString()}
            onChange={handleHoursChange}
            min="0"
            className="w-16 h-10 text-center bg-white border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`${label} hours`}
          />
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">:</span>
        </div>
        <input
          id={`${label}-${hours}-${minutes}-minutes`}
          type="number"
          value={minutes.toString().padStart(2, '0')}
          onChange={handleMinutesChange}
          min="0"
          max="59"
          className="w-16 h-10 text-center bg-white border border-slate-300 rounded-md font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`${label} minutes`}
        />
      </div>
    </div>
  );
};

interface AllocationTaskCardProps {
  task: Task;
  trackedSeconds: number;
  manualSeconds: number;
  onAllocationChange: (taskId: number, type: 'tracked' | 'manual', seconds: number) => void;
}

const AllocationTaskCard: React.FC<AllocationTaskCardProps> = ({
  task,
  trackedSeconds,
  manualSeconds,
  onAllocationChange,
}) => {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [note, setNote] = useState('');
  const totalTaskSeconds = trackedSeconds + manualSeconds;

  const handleTimeChange = (type: 'tracked' | 'manual', newHours: number, newMinutes: number) => {
    const totalSeconds = (newHours * 3600) + (newMinutes * 60);
    onAllocationChange(task.id, type, totalSeconds);
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 flex flex-col space-y-3 transition-shadow hover:shadow-md border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">{task.type}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm font-bold text-slate-700 whitespace-nowrap">
          <ClockIcon className="w-4 h-4" />
          <span>{formatTime(totalTaskSeconds, { showSeconds: false })} total</span>
        </div>
      </div>
      
      <hr className="border-slate-200" />
      
      <div className="space-y-2">
        <TimeInput 
            label="Tracked Time" 
            totalSeconds={trackedSeconds}
            onTimeChange={(h, m) => handleTimeChange('tracked', h, m)} 
        />
        <TimeInput 
            label="Untracked Time" 
            totalSeconds={manualSeconds}
            onTimeChange={(h, m) => handleTimeChange('manual', h, m)} 
        />
      </div>

      {manualSeconds > 0 && (
          <>
            <hr className="border-slate-200" />
            <div className="flex flex-col items-start">
                <button
                    type="button"
                    onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                    className="flex items-center space-x-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    <ChatBubbleIcon className="w-4 h-4" />
                    <span>Add Note</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isNoteExpanded ? 'rotate-180' : ''}`} />
                </button>
                <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${isNoteExpanded ? 'max-h-40 mt-2' : 'max-h-0'}`}>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add reason for untracked time..."
                        className="w-full h-24 p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>
            </div>
          </>
      )}
    </div>
  );
};

export default AllocationTaskCard;
