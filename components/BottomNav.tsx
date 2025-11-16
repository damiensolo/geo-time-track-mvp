import React from 'react';
import { SummaryIcon, TaskIcon, MenuIcon } from './icons';

const BottomNav: React.FC = () => {
  const navItems = [
    { name: 'Time', icon: SummaryIcon, active: true },
    { name: 'Task', icon: TaskIcon, active: false },
    { name: 'More Options', icon: MenuIcon, active: false },
  ];

  return (
    <footer className="bg-slate-50/75 backdrop-blur-xl border-t border-slate-200 flex justify-around flex-shrink-0 h-[83px]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const colorClass = item.active ? 'text-orange-500' : 'text-slate-500';

        return (
          <button key={item.name} className={`flex flex-col items-center justify-center w-24 pt-2 pb-1 rounded-md transition-colors hover:bg-slate-100 ${colorClass}`}>
            <Icon className="w-7 h-7 mb-0.5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </button>
        );
      })}
    </footer>
  );
};

export default BottomNav;