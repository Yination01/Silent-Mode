// Add to imports:
import RemoteConfigService from './src/config/remoteConfig';

// Add useEffect in App component:
useEffect(() => {
  const unsubscribe = RemoteConfigService.listenToConfig((config) => {
    if (config?.app?.maintenanceMode) {
      // Show maintenance screen
      setMaintenanceMessage(config.app.maintenanceMessage);
    }
    if (config?.app?.updateRequired) {
      // Check if user's version is older than min version
    }
  });
  return () => unsubscribe();
}, []);