import React from 'react';
import { ConnectivityState } from './types/index';
import { getInitialBrowserState } from './utils/api-listeners';

const INITIAL_STATE: ConnectivityState = {
  ...getInitialBrowserState(),
  downloadSpeed: null,
  uploadSpeed: null,
  latency: null,
  isTesting: false,
  isThrottled: false,
  isPoor: false,
  isGood: false,
  isExcellent: false,
  lastTestTimestamp: null,
  isOnline: false,
  runDownloadTest: async () => {},
  runUploadTest: async () => {},
  runLatencyTest: async () => {},
  runAllTests: async () => {},
  isTestReady: true,
  isSupported: false,
};

export const ConnectivityContext = React.createContext<ConnectivityState>(INITIAL_STATE);