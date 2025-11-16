import React, { useRef, useEffect } from 'react';
import type { Task, ClockEvent } from '../../types';
import { PlayIcon, PauseIcon, ChevronDownIcon, XCircleIconSolid, PaperclipIcon } from '../../components/icons';
import { formatTime } from '../../hooks/useTimer';

interface Photo {
  id: number;
  url: string;
}

interface TaskCardProps {
  task: Task;
  isClockedIn: boolean;
  isRunning: boolean;
  elapsedSeconds: number;
  onTimerToggle: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  note: string;
  onNoteChange: (taskId: number, note: string) => void;
  photos: Photo[];
  onOpenAttachmentSheet: (taskId: number) => void;
  onRemovePhoto: (taskId: number, photoId: number) => void;
  onPhotoClick: (url: string) => void;
  log: ClockEvent[];
}

const TaskCard: React.FC<TaskCardProps> = ({ 
    task, 
    isClockedIn, 
    isRunning, 
    elapsedSeconds, 
    onTimerToggle,
    isExpanded,
    onToggle,
    note,
    onNoteChange,
    photos,
    onOpenAttachmentSheet,
    onRemovePhoto,
    onPhotoClick,
    log
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && isExpanded) {
      // Use a timeout to ensure the browser has calculated the correct scrollHeight
      // after the element becomes visible from being hidden.
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'; // Reset height
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      }, 0);
    }
  }, [note, isExpanded]);

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
    <div className={`rounded-xl shadow-sm transition-all duration-300 border ${cardBg}`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <button 
            type="button"
            onClick={onTimerToggle}
            disabled={!isClockedIn}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${buttonColor} ${buttonHoverColor} ${buttonDisabledStyles}`}
            aria-label={isRunning ? `Pause timer for ${task.name}` : `Start timer for ${task.name}`}
          >
            {isRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0 mt-1 inline-block">{task.type}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <p className={`font-mono text-lg font-semibold transition-colors ${timerColor}`}>
            {formatTime(elapsedSeconds)}
          </p>
          <button 
            type="button"
            onClick={onToggle} 
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Toggle task details"
            aria-expanded={isExpanded}
          >
            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}
      >
        <div className="px-4 pt-4 pb-4 space-y-4 border-t border-slate-200/80">
          
          <div className="relative flex items-center">
            <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => onNoteChange(task.id, e.target.value)}
                placeholder="Write a comment..."
                rows={1}
                className="w-full pl-4 pr-12 py-3 text-base bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                aria-label={`Comment for task ${task.name}`}
            />
            <button 
                type="button"
                onClick={() => onOpenAttachmentSheet(task.id)} 
                className="absolute right-3 text-slate-500 hover:text-blue-600 transition-colors"
                aria-label="Add attachment"
            >
                <PaperclipIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Attachments Section */}
          {photos.length > 0 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                  {photos.map(photo => (
                  <div key={photo.id} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden group shadow-sm">
                      <img 
                      src={photo.url} 
                      alt="Attached content" 
                      className="w-full h-full object-cover bg-slate-200 cursor-pointer" 
                      onClick={() => onPhotoClick(photo.url)}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemovePhoto(task.id, photo.id);
                        }}
                        className="absolute top-1 right-1 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label="Remove photo"
                      >
                      <XCircleIconSolid className="w-5 h-5" />
                      </button>
                  </div>
                  ))}
              </div>
          )}
          
          {/* Activity Log Section */}
          {log.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-500 tracking-wider uppercase">ACTIVITY LOG</label>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;