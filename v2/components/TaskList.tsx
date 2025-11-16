import React from 'react';
import TaskCard from './TaskCard';
import { TASKS } from '../../constants';
import type { Task, ClockEvent } from '../../types';

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
  return (
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
            log={taskLogs[task.id] || []}
          />
        )
      })}
    </div>
  );
};

export default TaskList;