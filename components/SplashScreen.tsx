import React, { useState, useEffect } from 'react';
import LinarcLogo from './LinarcLogo';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500); // Start fade out at 2.5 seconds

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3000); // Unmount after 3 seconds

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`absolute inset-0 z-[100] flex items-center justify-center bg-slate-900 transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="animate-fadeInUp">
        <LinarcLogo className="w-48 h-auto" />
      </div>
    </div>
  );
};

export default SplashScreen;
