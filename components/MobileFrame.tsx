import React, { useState, useEffect } from 'react';

const StatusBar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateClock();
    const timerId = setInterval(updateClock, 30000); // Update every 30s is enough
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-[44px] px-5 flex items-center justify-between text-sm font-semibold text-black z-50">
      <div className="w-14 text-left font-medium text-[15px] tracking-tight">{time}</div>
      <div className="absolute left-1/2 -translate-x-1/2 h-8 w-32 bg-black rounded-full" />
      <div className="w-16 flex items-center justify-end space-x-1">
        {/* Signal Bars */}
        <svg width="18" height="12" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="10" width="3" height="4" rx="1" fill="black"/>
            <rect x="5.5" y="7" width="3" height="7" rx="1" fill="black"/>
            <rect x="10.5" y="4" width="3" height="10" rx="1" fill="black"/>
            <rect x="15.5" y="1" width="3" height="13" rx="1" fill="black" opacity="0.25"/>
        </svg>
        {/* WiFi Icon */}
        <svg width="18" height="12" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5.5C3.38814 3.42395 6.51347 2 10 2C13.4865 2 16.6119 3.42395 19 5.5M4.5 8.5C6.16667 7.5 7.83333 7 10 7C12.1667 7 13.8333 7.5 15.5 8.5M8 11.5C8.6875 11.125 9.3125 11 10 11C10.6875 11 11.3125 11.125 12 11.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Battery Icon */}
        <div className="relative w-7 h-3.5 border-[1.5px] border-black rounded-[4px] p-0.5 flex items-center">
            <div className="w-4/5 h-full bg-black rounded-sm"></div>
            <div className="absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-1 h-2 border-[1.5px] border-l-0 border-black rounded-r-sm"></div>
        </div>
      </div>
    </div>
  );
};


const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-[375px] h-[812px] bg-black rounded-[60px] shadow-2xl p-[10px] border-4 border-gray-800">
      <div className="w-full h-full bg-slate-100 rounded-[50px] overflow-hidden relative">
        <StatusBar />
        <div className="absolute top-0 left-0 right-0 bottom-0 pt-[44px] h-full w-full">
            {children}
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;