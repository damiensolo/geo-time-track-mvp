import React, { useState, useCallback } from 'react';
import TaskTimerScreen from './v3/screens/TaskTimerScreen';
import ProjectListScreen from './v3/screens/ProjectListScreen';
import Header from './components/Header';
import type { Project, ClockEvent } from './types';
import TimeAllocationScreen from './v3/screens/TimeAllocationScreen';

interface AppV3Props {
  isGeofenceOverridden: boolean;
  timeMultiplier: number;
  simulatedDistance: number;
}

const AppV3: React.FC<AppV3Props> = ({ isGeofenceOverridden, timeMultiplier, simulatedDistance }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [shiftDataForAllocation, setShiftDataForAllocation] = useState<{ 
    totalSeconds: number;
    initialAllocations: Record<number, number>;
    taskLogs: Record<number, ClockEvent[]>;
  } | null>(null);

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleGoBack = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleShiftEnd = useCallback((data: { totalSeconds: number; finalTaskTimes: Record<number, number>; taskLogs: Record<number, ClockEvent[]> }) => {
    setShiftDataForAllocation({ 
      totalSeconds: data.totalSeconds, 
      initialAllocations: data.finalTaskTimes,
      taskLogs: data.taskLogs
    });
  }, []);

  const handleAllocationComplete = useCallback(() => {
    setShiftDataForAllocation(null);
  }, []);

  const handleMoreOptions = useCallback(() => {
    // Placeholder for more options functionality
    alert('More options clicked! (V3)');
  }, []);

  return (
    <div className="bg-slate-100 h-full flex flex-col font-sans">
      <Header 
        title={shiftDataForAllocation ? 'Shift Details' : (selectedProject ? selectedProject.name : 'Projects')}
        showBackButton={!!selectedProject || !!shiftDataForAllocation}
        onBack={shiftDataForAllocation ? handleAllocationComplete : handleGoBack}
        showMoreOptionsButton={!!selectedProject && !shiftDataForAllocation}
        onMoreOptions={handleMoreOptions}
        version="v3"
      />

      <div className="relative flex-1 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${selectedProject ? '-translate-x-full' : 'translate-x-0'}`}
        >
            <ProjectListScreen onSelectProject={handleSelectProject} />
        </div>
        
        <div 
          className={`absolute top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out ${selectedProject ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {selectedProject && (
            <TaskTimerScreen 
              project={selectedProject} 
              isGeofenceOverridden={isGeofenceOverridden}
              timeMultiplier={timeMultiplier}
              simulatedDistance={simulatedDistance}
              onShiftEnd={handleShiftEnd}
            />
          )}
        </div>

        <div className={`absolute inset-0 bg-white z-30 transition-transform duration-300 ease-in-out ${shiftDataForAllocation ? 'translate-y-0' : 'translate-y-full'}`}>
          {shiftDataForAllocation && (
            <TimeAllocationScreen
              initialAllocations={shiftDataForAllocation.initialAllocations}
              taskLogs={shiftDataForAllocation.taskLogs}
              onConfirm={handleAllocationComplete}
              onCancel={handleAllocationComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AppV3;