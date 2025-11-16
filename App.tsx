import React, { useState } from 'react';
import TestingToolsPanel from './components/TestingToolsPanel';
import AppV1 from './AppV1';
import AppV2 from './AppV2';
import AppV3 from './AppV3';
import AppV4 from './AppV4';
import SplashScreen from './components/SplashScreen';

type AppVersion = 'v1' | 'v2' | 'v3' | 'v4';

const App: React.FC = () => {
  const [appVersion, setAppVersion] = useState<AppVersion>('v1');
  const [showSplash, setShowSplash] = useState(true);
  
  // State for testing tools, passed down to the active app version
  const [isGeofenceOverridden, setIsGeofenceOverridden] = useState<boolean>(true);
  const [timeMultiplier, setTimeMultiplier] = useState(100);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(1000); // Start outside at max distance
  const [showMap, setShowMap] = useState(false);

  const appProps = {
    isGeofenceOverridden,
    timeMultiplier,
    simulatedDistance,
  };

  const renderAppVersion = () => {
    switch(appVersion) {
      case 'v1':
        return <AppV1 {...appProps} showMap={showMap} />;
      case 'v2':
        return <AppV2 {...appProps} />;
      case 'v3':
        return <AppV3 {...appProps} />;
      case 'v4':
        return <AppV4 {...appProps} />;
      default:
        return <AppV1 {...appProps} showMap={showMap} />;
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      
      <div className={`h-full flex flex-col ${showSplash ? 'opacity-0' : 'opacity-500 transition-opacity duration-100'}`}>
        {renderAppVersion()}
        
        <TestingToolsPanel 
          isGeofenceOverridden={isGeofenceOverridden}
          onGeofenceOverrideToggle={() => setIsGeofenceOverridden(prev => !prev)}
          simulatedDistance={simulatedDistance}
          onSimulatedDistanceChange={setSimulatedDistance}
          timeMultiplier={timeMultiplier}
          onTimeMultiplierChange={setTimeMultiplier}
          currentVersion={appVersion}
          onVersionChange={setAppVersion}
          showMap={showMap}
          onShowMapToggle={() => setShowMap(prev => !prev)}
        />
      </div>
    </>
  );
};

export default App;