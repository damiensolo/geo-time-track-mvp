import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { TASKS } from '../../constants';
import type { Task, ClockEvent } from '../../types';
import { XIcon, CameraIcon, PhotoIcon } from '../../components/icons';
import CameraCaptureModal from '../../components/CameraCaptureModal';

// --- Start of inlined ImageModal component ---
interface ImageModalProps {
  src: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <button
        onClick={(e) => {
            e.stopPropagation();
            onClose();
        }}
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 bg-black/30 rounded-full p-1"
        aria-label="Close image view"
      >
        <XIcon className="w-6 h-6" />
      </button>
      <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="Full screen view of attached"
          className="w-full h-full object-cover"
          style={{ animation: 'fadeInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        />
      </div>
    </div>
  );
};
// --- End of inlined ImageModal component ---

// --- Start of inlined AttachmentSheet component ---
interface AttachmentAction {
  label: string;
  icon: React.FC<{ className?: string }>;
  onClick: () => void;
}

interface AttachmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  actions: AttachmentAction[];
}

const AttachmentSheet: React.FC<AttachmentSheetProps> = ({ isOpen, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end" 
      aria-modal="true" 
      role="dialog"
    >
      <div 
        className="absolute inset-0 bg-black/40 animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative z-10 w-full bg-white rounded-t-2xl shadow-xl" style={{ animation: 'fadeInUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
        <div className="pt-4 px-4 pb-2 text-center relative">
          <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto" />
          <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-2" aria-label="Close attachment options">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <ul className="py-2 px-4 pb-4">
          {actions.map((action, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className="w-full flex items-center p-3 text-left text-lg text-slate-800 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="bg-slate-100 p-2 rounded-lg mr-4">
                  <action.icon className="w-6 h-6 text-slate-700" />
                </div>
                <span className="font-medium">{action.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
// --- End of inlined AttachmentSheet component ---

interface Photo {
  id: number;
  url: string;
}

interface TaskListProps {
  isClockedIn: boolean;
  activeTaskId: number | null;
  taskTimers: Record<number, number>;
  onTaskTimerToggle: (taskId: number) => void;
  currentTime: number;
  activeTaskStartTime: number | null;
  timeMultiplier: number;
  taskLogs: Record<number, ClockEvent[]>;
}

const TaskList: React.FC<TaskListProps> = ({
  isClockedIn,
  activeTaskId,
  taskTimers,
  onTaskTimerToggle,
  currentTime,
  activeTaskStartTime,
  timeMultiplier,
  taskLogs,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [attachedPhotos, setAttachedPhotos] = useState<Record<number, Photo[]>>({});
  const [taskNotes, setTaskNotes] = useState<Record<number, string>>({});
  
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const handleToggle = (taskId: number) => {
    setExpandedTaskId(prevId => (prevId === taskId ? null : taskId));
  };
  
  const handleNoteChange = (taskId: number, note: string) => {
    setTaskNotes(prev => ({ ...prev, [taskId]: note }));
  };

  const handleAttachPlaceholderPhoto = (taskId: number) => {
    if (!taskId) return;
    setAttachedPhotos(prev => {
      const existingPhotos = prev[taskId] || [];
      const newPhoto = { id: Date.now(), url: `https://picsum.photos/seed/${taskId}-${existingPhotos.length}-${Date.now()}/200/200` };
      return { ...prev, [taskId]: [...existingPhotos, newPhoto] };
    });
  };
  
  const handlePhotoCaptured = (imageDataUrl: string) => {
    if (selectedTaskId) {
        setAttachedPhotos(prev => {
            const existingPhotos = prev[selectedTaskId] || [];
            const newPhoto = { id: Date.now(), url: imageDataUrl };
            return { ...prev, [selectedTaskId]: [...existingPhotos, newPhoto] };
        });
    }
    setIsCameraModalOpen(false);
  };

  const handleRemovePhoto = (taskId: number, photoId: number) => {
    setAttachedPhotos(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || []).filter(photo => photo.id !== photoId)
    }));
  };
  
  const handleOpenAttachmentSheet = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsActionSheetOpen(true);
  };
  
  const handleOpenRealCamera = () => {
      if(selectedTaskId) {
          setIsCameraModalOpen(true);
      }
  };

  const handlePhotoClick = (url: string) => {
    setSelectedImageUrl(url);
  };

  const actions: AttachmentAction[] = [
    { label: 'Take a Photo', icon: CameraIcon, onClick: handleOpenRealCamera },
    { label: 'Photo Library', icon: PhotoIcon, onClick: () => { if (selectedTaskId) handleAttachPlaceholderPhoto(selectedTaskId); } },
  ];

  return (
    <>
      <div className="space-y-3">
        {TASKS.map((task: Task) => {
          const isRunning = activeTaskId === task.id;
          const baseSeconds = taskTimers[task.id] || 0;
          let activeSeconds = 0;

          if (isRunning && activeTaskStartTime) {
            const diff = currentTime - activeTaskStartTime;
            activeSeconds = Math.round((Math.max(0, diff) * timeMultiplier) / 1000);
          }

          return (
            <TaskCard 
              key={task.id} 
              task={task}
              isClockedIn={isClockedIn}
              isRunning={isRunning}
              elapsedSeconds={baseSeconds + activeSeconds}
              onTimerToggle={() => onTaskTimerToggle(task.id)}
              isExpanded={expandedTaskId === task.id}
              onToggle={() => handleToggle(task.id)}
              note={taskNotes[task.id] || ''}
              onNoteChange={handleNoteChange}
              photos={attachedPhotos[task.id] || []}
              onOpenAttachmentSheet={handleOpenAttachmentSheet}
              onRemovePhoto={handleRemovePhoto}
              onPhotoClick={handlePhotoClick}
              log={taskLogs[task.id] || []}
            />
          )
        })}
      </div>
      <AttachmentSheet 
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        actions={actions}
      />
      {selectedImageUrl && (
        <ImageModal 
          src={selectedImageUrl} 
          onClose={() => setSelectedImageUrl(null)} 
        />
      )}
      {isCameraModalOpen && (
        <CameraCaptureModal
            onCapture={handlePhotoCaptured}
            onClose={() => setIsCameraModalOpen(false)}
        />
      )}
    </>
  );
};

export default TaskList;