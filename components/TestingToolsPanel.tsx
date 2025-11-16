import React from 'react';

type AppVersion = 'v1' | 'v2' | 'v3' | 'v4';

interface TestingToolsPanelProps {
  isGeofenceOverridden: boolean;
  onGeofenceOverrideToggle: () => void;
  simulatedDistance: number;
  onSimulatedDistanceChange: (distance: number) => void;
  timeMultiplier: number;
  onTimeMultiplierChange: (speed: number) => void;
  currentVersion: AppVersion;
  onVersionChange: (version: AppVersion) => void;
  showMap?: boolean;
  onShowMapToggle?: () => void;
}

const TestingToolsPanel: React.FC<TestingToolsPanelProps> = ({
  isGeofenceOverridden,
  onGeofenceOverrideToggle,
  simulatedDistance,
  onSimulatedDistanceChange,
  timeMultiplier,
  onTimeMultiplierChange,
  currentVersion,
  onVersionChange,
  showMap,
  onShowMapToggle,
}) => {
  const maxDistance = 1000;
  const versions: AppVersion[] = ['v1', 'v2', 'v3', 'v4'];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = Number(e.target.value);
    onSimulatedDistanceChange(maxDistance - sliderValue);
  };

  // The slider's value is the inverse of the distance.
  // Left (0) = max distance, Right (max) = 0 distance.
  const sliderValue = maxDistance - simulatedDistance;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[100] max-w-xs w-full space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-bold text-slate-600 tracking-wider uppercase">Testing Tools</h3>
      </div>
      
      <hr/>

      <div className="text-center">
        <h4 className="text-sm font-semibold text-slate-700">App Version</h4>
         <div className="flex justify-center rounded-lg bg-slate-200 p-1 mt-3">
            {versions.map((version) => (
              <button
                key={version}
                type="button"
                onClick={() => onVersionChange(version)}
                className={`w-1/4 rounded-md py-1 text-sm font-semibold transition-colors ${
                  currentVersion === version
                    ? 'bg-white text-slate-800 shadow'
                    : 'text-slate-600'
                }`}
              >
                {version.toUpperCase()}
              </button>
            ))}
        </div>
      </div>

      {currentVersion === 'v1' && onShowMapToggle && (
        <>
          <hr/>
          <div>
              <h4 className="text-sm font-semibold text-slate-700 text-center">Map Visibility</h4>
              <div className="flex items-center justify-center space-x-2 mt-3">
                  <label htmlFor="map-toggle" className="text-sm text-gray-600 font-medium">Status: {showMap ? 'Visible' : 'Hidden'}</label>
                  <button
                      type="button"
                      id="map-toggle"
                      onClick={onShowMapToggle}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${showMap ? 'bg-green-500' : 'bg-gray-300'}`}
                      aria-pressed={showMap}
                      aria-label="Toggle Map Visibility"
                  >
                      <span
                          aria-hidden="true"
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${showMap ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                  </button>
              </div>
          </div>
        </>
      )}
      
      <hr/>

      <div>
          <h4 className="text-sm font-semibold text-slate-700 text-center">Geofence Override</h4>
          <div className="flex items-center justify-center space-x-2 mt-3">
              <label htmlFor="geofence-toggle" className="text-sm text-gray-600 font-medium">Status: {isGeofenceOverridden ? 'Active' : 'Inactive'}</label>
              <button
                  type="button"
                  id="geofence-toggle"
                  onClick={onGeofenceOverrideToggle}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 ${isGeofenceOverridden ? 'bg-green-500' : 'bg-gray-300'}`}
                  aria-pressed={isGeofenceOverridden}
                  aria-label="Override Geofence"
              >
                  <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isGeofenceOverridden ? 'translate-x-5' : 'translate-x-0'}`}
                  />
              </button>
          </div>
      </div>

      <hr/>

      <div className="text-center">
          <h4 className="text-sm font-semibold text-slate-700">Location Simulator</h4>
           <p className="text-xs text-slate-500 mt-1 mb-3">Drag right to move into geofence</p>
          <input
              type="range"
              min="0"
              max={maxDistance}
              step="10"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Simulate location distance"
          />
          <p className="text-sm font-medium text-slate-600 mt-2">{simulatedDistance}m from job site</p>
      </div>
      
      <hr/>
      
      <div className="text-center">
        <h4 className="text-sm font-semibold text-slate-700">Time Simulator</h4>
        <p className="text-xs text-slate-500 mt-1 mb-3">Speed up time for testing</p>
        <div className="flex justify-center space-x-2">
          {[1, 10, 100, 1000].map(speed => (
            <button
              key={speed}
              type="button"
              onClick={() => onTimeMultiplierChange(speed)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                timeMultiplier === speed
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestingToolsPanel;
