import { NetworkInformationState, ConnectivityState } from '../types/index';

const CONNECTION = typeof navigator !== 'undefined' ? (navigator as any).connection : null;

export const getInitialBrowserState = (): Partial<ConnectivityState> => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  const netInfo: NetworkInformationState = CONNECTION ? {
    effectiveType: CONNECTION.effectiveType,
    downlink: CONNECTION.downlink,
    rtt: CONNECTION.rtt,
    saveData: CONNECTION.saveData,
    type: CONNECTION.type,
  } : {};

  return {
    isSupported: !!CONNECTION,
    isOnline,
    ...netInfo,
  };
};

export const setupBrowserListeners = (callback: (updates: Partial<ConnectivityState>) => void) => {
  const updateInfo = () => {
    const isOnline = navigator.onLine;
    const netInfo: NetworkInformationState = CONNECTION ? {
      effectiveType: CONNECTION.effectiveType,
      downlink: CONNECTION.downlink,
      rtt: CONNECTION.rtt,
      saveData: CONNECTION.saveData,
      type: CONNECTION.type,
    } : {};

    callback({ isOnline, ...netInfo });
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', updateInfo);
    window.addEventListener('offline', updateInfo);
    if (CONNECTION) {
      CONNECTION.addEventListener('change', updateInfo);
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', updateInfo);
      window.removeEventListener('offline', updateInfo);
      if (CONNECTION) {
        CONNECTION.removeEventListener('change', updateInfo);
      }
    }
  };
};