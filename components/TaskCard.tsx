import React from 'react';
import type { Task } from '../types';
import { PaperclipIcon, ChevronDownIcon, XCircleIconSolid } from './icons';

interface Photo {
  id: number;
  url: string;
}

interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggle: () => void;
  photos: Photo[];
  onOpenAttachmentSheet: (taskId: number) => void;
  onRemovePhoto: (taskId: number, photoId: number) => void;
  onPhotoClick: (url: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isExpanded, onToggle, photos, onOpenAttachmentSheet, onRemovePhoto, onPhotoClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm transition-shadow hover:shadow-md">
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className="font-semibold text-slate-800 text-base truncate">{task.name}</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">{task.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="px-4 pt-1 pb-4 space-y-4">
          <div className="relative flex items-center">
              <input
                  type="text"
                  placeholder="Write a comment..."
                  className="w-full pl-4 pr-12 py-3 text-base bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Add a comment"
              />
              <button 
                onClick={() => onOpenAttachmentSheet(task.id)} 
                className="absolute right-3 text-slate-500 hover:text-slate-800 transition-colors"
                aria-label="Add attachment"
              >
                  <PaperclipIcon className="w-6 h-6" />
              </button>
          </div>

          {photos.length > 0 && (
            <div className="mt-4">
              <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                {photos.map(photo => (
                  <div key={photo.id} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden group shadow-sm">
                    <img 
                      src={photo.url} 
                      alt="Attached placeholder" 
                      className="w-full h-full object-cover bg-slate-200 cursor-pointer" 
                      onClick={() => onPhotoClick(photo.url)}
                    />
                    <button
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;