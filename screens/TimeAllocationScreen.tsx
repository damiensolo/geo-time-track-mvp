import React, { useState, useMemo, useRef } from 'react';
import { TASKS } from '../constants';
import AllocationTaskCard from '../components/AllocationTaskCard';
import { formatTime } from '../hooks/useTimer';
import { useDragToScroll } from '../hooks/useDragToScroll';
import type { ClockEvent } from '../types';

interface TimeAllocationScreenProps {
  totalShiftSeconds: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const TOTAL_SHIFT_GOAL_SECONDS = 8 * 60 * 60; // 8 hours

const TimeAllocationScreen: React.FC<TimeAllocationScreenProps> = ({
  totalShiftSeconds,
  onConfirm,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useDragToScroll(scrollRef);
  
  const [allocations, setAllocations] = useState<Record<number, number>>(() => {
    // By default, pre-allocate the entire tracked shift time to the first task.
    // The user can then redistribute this time across other tasks as needed.
    // This makes it clear how much time needs to be allocated.
    return TASKS.reduce((acc, task, index) => {
      acc[task.id] = index === 0 ? totalShiftSeconds : 0;
      return acc;
    }, {} as Record<number, number>);
  });

  // V1 does not have pre-tracked task times for individual tasks.
  const taskLogs: Record<number, ClockEvent[]> = {};

  const { totalAllocatedTime, totalTrackedAllocated, totalUntrackedAllocated } = useMemo(() => {
    // FIX: Explicitly typing the reducer's parameters resolves TypeScript's incorrect type inference.
    const totalAllocated = (Object.values(allocations) as number[]).reduce((sum, seconds) => sum + (seconds || 0), 0);
    const tracked = Math.min(totalAllocated, totalShiftSeconds);
    const untracked = Math.max(0, totalAllocated - totalShiftSeconds);
    return { 
      totalAllocatedTime: totalAllocated,
      totalTrackedAllocated: tracked,
      totalUntrackedAllocated: untracked
    };
  }, [allocations, totalShiftSeconds]);

  const remainingSeconds = TOTAL_SHIFT_GOAL_SECONDS - totalAllocatedTime;
  const isAllocationComplete = remainingSeconds >= 0;
  
  const handleAllocationChange = (taskId: number, newSeconds: number) => {
    setAllocations(prev => {
        // FIX: Explicitly typing the reducer's parameters resolves TypeScript's incorrect type inference.
        const otherTasksTotal = Object.entries(prev).reduce((sum: number, [id, secs]: [string, number]) => {
            if (parseInt(id, 10) === taskId) return sum;
            return sum + (secs || 0);
        }, 0);

        let cappedNewSeconds = Math.max(0, newSeconds);
        if (otherTasksTotal + cappedNewSeconds > TOTAL_SHIFT_GOAL_SECONDS) {
            cappedNewSeconds = TOTAL_SHIFT_GOAL_SECONDS - otherTasksTotal;
        }

        return {
            ...prev,
            [taskId]: cappedNewSeconds
        };
    });
  };
  
  const handleConfirmClick = () => {
    if (!isAllocationComplete) return;

    if (totalAllocatedTime < TOTAL_SHIFT_GOAL_SECONDS) {
      setIsConfirming(true);
    } else {
      onConfirm();
    }
  };
  
  const handleProceedWithUnderAllocation = () => {
    onConfirm();
    setIsConfirming(false);
  };

  const handleCancelConfirmation = () => {
    setIsConfirming(false);
  };

  const getButtonText = () => {
    if (remainingSeconds < 0) {
      return `Overallocated by ${formatTime(Math.abs(remainingSeconds))}`;
    }
    return 'Confirm Allocation';
  };

  const getButtonClasses = () => {
    if (remainingSeconds < 0) {
      return 'bg-red-500 cursor-not-allowed';
    }
    if (totalAllocatedTime < TOTAL_SHIFT_GOAL_SECONDS) {
      return 'bg-orange-500 hover:bg-orange-600'; // Warning state
    }
    return 'bg-green-600 hover:bg-green-700'; // Success state
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <main className="flex-grow flex flex-col p-4 space-y-4 overflow-hidden">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col space-y-3 flex-shrink-0">
            <div className="text-center">
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">TOTAL SHIFT</p>
                <div className="flex items-baseline justify-center space-x-1 mt-1">
                    <p className={`text-2xl font-semibold tracking-tight ${totalAllocatedTime === TOTAL_SHIFT_GOAL_SECONDS && TOTAL_SHIFT_GOAL_SECONDS > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                        {formatTime(totalAllocatedTime)}
                    </p>
                    <p className="text-lg font-semibold text-slate-500 tracking-tight">
                       / {formatTime(TOTAL_SHIFT_GOAL_SECONDS)} hrs
                    </p>
                </div>
            </div>

            <hr className="border-slate-200/60" />
            
            <div className="grid grid-cols-3 divide-x divide-slate-200/60 text-center">
                <div>
                    <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">TRACKED</p>
                    <p className="text-xl font-semibold text-blue-600 tracking-tight mt-1">{formatTime(totalTrackedAllocated)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">UNTRACKED</p>
                    <p className="text-xl font-semibold text-yellow-600 tracking-tight mt-1">{formatTime(totalUntrackedAllocated)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">REMAINING</p>
                    <p className={`text-xl font-semibold tracking-tight mt-1 ${remainingSeconds === 0 ? 'text-green-600' : 'text-slate-800'}`}>
                        {formatTime(Math.max(0, remainingSeconds))}
                    </p>
                </div>
            </div>
        </div>
        
        <div ref={scrollRef} className="flex-grow bg-white rounded-xl shadow p-2 overflow-y-auto no-scrollbar">
            <div className="space-y-3">
                {TASKS.map(task => (
                    <AllocationTaskCard
                      key={task.id}
                      task={task}
                      originalTrackedSeconds={0}
                      allocatedSeconds={allocations[task.id] || 0}
                      onAllocationChange={handleAllocationChange}
                      totalShiftSeconds={TOTAL_SHIFT_GOAL_SECONDS}
                      log={taskLogs[task.id] || []}
                    />
                ))}
            </div>
        </div>
      </main>

      <footer className="p-4 bg-white/75 backdrop-blur-xl border-t border-slate-200 flex-shrink-0">
        <button
          onClick={handleConfirmClick}
          disabled={!isAllocationComplete}
          className={`w-full py-4 text-white font-bold rounded-lg transition-colors text-lg ${getButtonClasses()}`}
        >
          {getButtonText()}
        </button>
      </footer>

      {isConfirming && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Confirm Submission</h2>
            <p className="text-sm text-slate-600">
              Your total shift time ({formatTime(totalAllocatedTime)}) is less than the standard 8-hour shift.
            </p>
            <p className="text-sm text-slate-600 font-medium">Are you sure you want to submit?</p>
            <div className="flex justify-center space-x-3 !mt-6">
              <button
                onClick={handleCancelConfirmation}
                className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedWithUnderAllocation}
                className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeAllocationScreen;