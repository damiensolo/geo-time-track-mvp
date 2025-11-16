import React, { useState, useMemo, useRef } from 'react';
import { TASKS } from '../../constants';
import AllocationTaskCard from '../components/AllocationTaskCard';
import { formatTime } from '../../hooks/useTimer';
import { useDragToScroll } from '../../hooks/useDragToScroll';
import type { ClockEvent } from '../../types';

interface Allocation {
  tracked: number;
  manual: number;
}

interface TimeAllocationScreenProps {
  totalShiftSeconds: number;
  initialAllocations: Record<number, number>; 
  taskLogs: Record<number, ClockEvent[]>;
  onConfirm: () => void;
  onCancel: () => void;
}

const TOTAL_SHIFT_GOAL_SECONDS = 8 * 60 * 60; // 8 hours - The source of truth for the shift

const TimeAllocationScreen: React.FC<TimeAllocationScreenProps> = ({
  initialAllocations,
  taskLogs,
  onConfirm,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useDragToScroll(scrollRef);

  const originalTrackedAllocations = useMemo(() => {
    return TASKS.reduce((acc, task) => {
      const trackedSeconds = initialAllocations[task.id] || 0;
      acc[task.id] = Math.round(trackedSeconds / 60) * 60;
      return acc;
    }, {} as Record<number, number>);
  }, [initialAllocations]);

  const totalTrackedTimeFromShift = useMemo(() => 
    // FIX: Explicitly type the accumulator and value in the `reduce` callback to resolve a type inference issue.
    Object.values(originalTrackedAllocations).reduce((sum: number, seconds: number) => sum + seconds, 0),
    [originalTrackedAllocations]
  );

  const [allocations, setAllocations] = useState<Record<number, Allocation>>(() => {
    return TASKS.reduce((acc, task) => {
      acc[task.id] = {
        tracked: originalTrackedAllocations[task.id] || 0,
        manual: 0,
      };
      return acc;
    }, {} as Record<number, Allocation>);
  });

  const { totalTrackedSeconds, totalManualSeconds, totalAllocatedTime } = useMemo(() => {
    let tracked = 0;
    let manual = 0;
    // FIX: Cast the result of Object.values to the correct type to help TypeScript's type inference.
    for (const alloc of Object.values(allocations) as Allocation[]) {
        tracked += alloc.tracked;
        manual += alloc.manual;
    }
    return { totalTrackedSeconds: tracked, totalManualSeconds: manual, totalAllocatedTime: tracked + manual };
  }, [allocations]);

  const remainingSeconds = TOTAL_SHIFT_GOAL_SECONDS - totalAllocatedTime;
  
  const handleAllocationChange = (taskId: number, type: 'tracked' | 'manual', newSeconds: number) => {
    setAllocations(prev => {
        const updated = { ...prev };
        const oldVal = updated[taskId][type];
        let cappedNewSeconds = Math.max(0, newSeconds);

        // Check against total tracked pool
        if (type === 'tracked') {
            const currentTotalTracked = totalTrackedSeconds - oldVal;
            if (currentTotalTracked + cappedNewSeconds > totalTrackedTimeFromShift) {
                cappedNewSeconds = totalTrackedTimeFromShift - currentTotalTracked;
            }
        }
        
        // Check against total shift goal
        const currentTotalAllocated = totalAllocatedTime - oldVal;
        if (currentTotalAllocated + cappedNewSeconds > TOTAL_SHIFT_GOAL_SECONDS) {
            cappedNewSeconds = TOTAL_SHIFT_GOAL_SECONDS - currentTotalAllocated;
        }

        updated[taskId] = { ...updated[taskId], [type]: cappedNewSeconds };
        return updated;
    });
  };
  
  const handleConfirmClick = () => {
    if (remainingSeconds > 0) {
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

  const getButtonClasses = () => {
      if (remainingSeconds > 0) {
          return 'bg-orange-500 hover:bg-orange-600'; // Warning state
      }
      return 'bg-green-600 hover:bg-green-700'; // Success state
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 relative">
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
                 <p className="text-sm font-medium text-slate-500 mt-1">8:00am-4:00pm</p>
            </div>

            <hr className="border-slate-200/60" />
            
            <div className="grid grid-cols-3 divide-x divide-slate-200/60 text-center">
                <div>
                    <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">TRACKED</p>
                    <p className="text-xl font-semibold text-slate-800 tracking-tight mt-1">{formatTime(totalTrackedSeconds)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">MANUAL</p>
                    <p className="text-xl font-semibold text-slate-800 tracking-tight mt-1">{formatTime(totalManualSeconds)}</p>
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
                      originalTrackedSeconds={originalTrackedAllocations[task.id] || 0}
                      trackedSeconds={allocations[task.id].tracked}
                      manualSeconds={allocations[task.id].manual}
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
          className={`w-full py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_0_rgb(0,0,0,0.2)] text-lg ${getButtonClasses()}`}
        >
          Send for approval
        </button>
      </footer>

      {isConfirming && (
        <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Confirm Submission</h2>
            <p className="text-sm text-slate-600">
              Your allocated time ({formatTime(totalAllocatedTime)}) is less than your total shift time ({formatTime(TOTAL_SHIFT_GOAL_SECONDS)}).
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