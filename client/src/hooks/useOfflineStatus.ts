import { useState, useEffect } from 'react';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isOverridden, setIsOverridden] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      if (!isOverridden) {
        setIsOnline(true);
      }
    };
    const handleOffline = () => {
      if (!isOverridden) {
        setIsOnline(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOverridden]);

  // Set virtual connection status for simulations
  const simulateConnection = (online: boolean | null) => {
    if (online === null) {
      setIsOverridden(false);
      setIsOnline(navigator.onLine);
    } else {
      setIsOverridden(true);
      setIsOnline(online);
    }
  };

  return {
    isOnline,
    isOverridden,
    simulateConnection,
    realStatus: navigator.onLine,
  };
}
export default useOfflineStatus;
