import React, { useState, useMemo } from 'react';
import type { Task, ClockEvent } from '../types';
import { formatTime } from '../hooks/useTimer';
import { ChatBubbleIcon, ChevronDownIcon } from './icons';

interface AllocationTaskCardProps {
  task: Task;
  originalTrackedSeconds: number;
  allocatedSeconds: number;
  onAllocationChange: (taskId: number, seconds: number) => void;
  totalShiftSeconds: number;
  log: ClockEvent[];
}

const AllocationTaskCard: React.FC<AllocationTaskCardProps> = ({
  task,
  originalTrackedSeconds,
  allocatedSeconds,
  onAllocationChange,
  totalShiftSeconds,
  log,
}) => {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isLogExpanded, setIsLogExpanded] = useState(false);
  const [note, setNote] = useState('');
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAllocationChange(task.id, parseInt(e.target.value, 10));
  };
  
  const allocatedPct = useMemo(() => 
    totalShiftSeconds > 0 ? (allocatedSeconds / totalShiftSeconds) * 100 : 0,
    [allocatedSeconds, totalShiftSeconds]
  );

  const formatLogTime = (date: Date) => {
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 flex flex-col space-y-4 transition-shadow hover:shadow-sm border border-slate-200/80">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 text-base leading-tight">{task.name}</h3>
        <span className="font-mono text-lg font-semibold text-slate-700">{formatTime(allocatedSeconds)}</span>
      </div>
      
      <div>
        <div className="relative h-8 flex items-center">
          <div className="absolute w-full h-3 bg-slate-200 rounded-full top-1/2 -translate-y-1/2" />
          <div style={{ width: `${allocatedPct}%`}} className="absolute h-3 bg-blue-500 rounded-l-full transition-all duration-100 top-1/2 -translate-y-1/2" />
          
          <input
            type="range"
            min="0"
            max={totalShiftSeconds}
            value={allocatedSeconds}
            step={60}
            onChange={handleSliderChange}
            className="absolute w-full h-3 top-1/2 -translate-y-1/2 appearance-none bg-transparent cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-blue-500 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:ring-2 [&::-moz-range-thumb]:ring-blue-500"
          />
        </div>
      </div>

      {(allocatedSeconds > 0) && (
        <>
          <hr className="!mt-3 border-slate-200" />
          <div className="flex flex-col items-start !mt-2">
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
                placeholder="Add reason for time adjustment..."
                className="w-full h-24 p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </>
      )}

      {log.length > 0 && (
        <>
          <hr className="!mt-3 border-slate-200" />
          <div className="flex flex-col items-start !mt-2">
            <button
              type="button"
              onClick={() => setIsLogExpanded(!isLogExpanded)}
              className="w-full flex justify-between items-center text-sm font-medium text-blue-600 hover:text-blue-800 p-1"
              aria-expanded={isLogExpanded}
            >
              <span className="font-bold">Activity Log</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isLogExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${isLogExpanded ? 'max-h-48 pt-2' : 'max-h-0'}`}>
              <ul className="space-y-2 text-sm text-slate-700 border-t border-slate-200 pt-3">
                {log.map((event, index) => (
                  <li key={index} className="flex items-center justify-between animate-fadeInUp" style={{animationDelay: `${index * 50}ms`}}>
                    <div className="flex items-center">
                      <span className={`w-2.5 h-2.5 rounded-full mr-3 ${event.type === 'in' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{event.type === 'in' ? 'Started' : 'Stopped'}</span>
                    </div>
                    <span className="font-mono">{formatLogTime(event.timestamp)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllocationTaskCard;
