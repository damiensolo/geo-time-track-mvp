import React from 'react';
import { ChevronLeftIcon, MenuIcon } from './icons';
import LinarcLogo from './LinarcLogo';

interface HeaderProps {
    title: string;
    onBack?: () => void;
    showBackButton?: boolean;
    showMoreOptionsButton?: boolean;
    onMoreOptions?: () => void;
    // FIX: Added 'v3' to the version prop type to support the V3 app version.
    version?: 'v1' | 'v2' | 'v3' | 'v4';
}

const Header: React.FC<HeaderProps> = ({ title, onBack, showBackButton = false, showMoreOptionsButton = false, onMoreOptions, version }) => {
  return (
    <header className="bg-slate-800 text-slate-100 px-4 flex items-center justify-between border-b border-slate-700 z-20 h-[44px] flex-shrink-0">
      <div className="flex-1 flex justify-start">
        {showBackButton ? (
            <button onClick={onBack} className="p-1 -ml-2 text-slate-100 flex items-center" aria-label="Go back">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
        ) : (
            <div className="flex items-center space-x-2">
                <LinarcLogo className="h-8 w-auto" />
                {version && (
                    <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-md">
                        {version.toUpperCase()}
                    </span>
                )}
            </div>
        )}
      </div>
      
      <div className="flex-1 flex justify-center">
        {showBackButton && (
          <h1 className="text-[17px] font-semibold truncate text-white">{title}</h1>
        )}
      </div>

      <div className="flex-1 flex justify-end">
        {showMoreOptionsButton && (
          <button onClick={onMoreOptions} className="p-1 -mr-2 text-slate-100" aria-label="More options">
            <MenuIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;