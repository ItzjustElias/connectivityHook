import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ConnectivityProviderProps, ConnectivityState } from './types/index';
import { ConnectivityContext } from './context';
import { 
  DEFAULT_THRESHOLDS, 
  DEFAULT_DOWNLOAD_URL, 
  DEFAULT_UPLOAD_URL, 
  DEFAULT_LATENCY_URL, 
  TEST_COOLDOWN_MS, 
  TEST_CHUNK_SIZE_BYTES,
  runDownloadTest,
  runUploadTest,
  runLatencyTest,
} from './utils/benchmark-utils';
import { setupBrowserListeners, getInitialBrowserState } from './utils/api-listeners';

const getInitialState = (initialProps: ConnectivityProviderProps): ConnectivityState => {
  return {
    ...getInitialBrowserState(),
    ...initialProps.initialState,
    downloadSpeed: null,
    uploadSpeed: null,
    latency: null,
    isTesting: false,
    isThrottled: false,
    isPoor: false,
    isGood: false,
    isExcellent: false,
    isOnline: false,
    lastTestTimestamp: null,
    runDownloadTest: async () => {},
    runUploadTest: async () => {},
    runLatencyTest: async () => {},
    runAllTests: async () => {},
    isTestReady: true,
    isSupported: false,
  };
};

export const ConnectivityProvider: React.FC<ConnectivityProviderProps> = (props) => {
  const [state, setState] = useState<ConnectivityState>(() => getInitialState(props));

  const { 
    downloadTestUrl = DEFAULT_DOWNLOAD_URL, 
    uploadTestUrl = DEFAULT_UPLOAD_URL,
    latencyTestUrl = DEFAULT_LATENCY_URL, 
    thresholds = DEFAULT_THRESHOLDS,
    pollInterval,
  } = props;

  const updateState = useCallback((updates: Partial<ConnectivityState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // --- BENCHMARK RUNNERS ---

  const createTestRunner = useCallback((testFn: (url: string, size: number) => Promise<number | null>, 
                                          url: string, 
                                          size: number = 0, 
                                          metricKey: keyof ConnectivityState = 'latency') => async () => {
      if (state.isTesting || !state.isOnline) return;
      updateState({ isTesting: true });
      
      const result = await testFn(url, size);
      
      updateState({ 
          [metricKey]: result, 
          isTesting: false, 
          lastTestTimestamp: Date.now() 
      });
    }, [state.isTesting, state.isOnline, updateState]);
  
  const runLatencyTestCb = useMemo(() => createTestRunner(runLatencyTest, latencyTestUrl, undefined, 'latency'), [createTestRunner, latencyTestUrl]);
  const runDownloadTestCb = useMemo(() => createTestRunner(runDownloadTest, downloadTestUrl, TEST_CHUNK_SIZE_BYTES, 'downloadSpeed'), [createTestRunner, downloadTestUrl]);
  const runUploadTestCb = useMemo(() => createTestRunner(runUploadTest, uploadTestUrl, TEST_CHUNK_SIZE_BYTES, 'uploadSpeed'), [createTestRunner, uploadTestUrl]);

  const runAllTests = useCallback(async () => {
    if (!state.isOnline || state.isTesting) return;
    updateState({ isTesting: true });
    
    const [download, upload, latency] = await Promise.all([
      runDownloadTest(downloadTestUrl, TEST_CHUNK_SIZE_BYTES),
      runUploadTest(uploadTestUrl, TEST_CHUNK_SIZE_BYTES),
      runLatencyTest(latencyTestUrl),
    ]);
    
    updateState({ 
        downloadSpeed: download, 
        uploadSpeed: upload, 
        latency: latency,
        isTesting: false,
        lastTestTimestamp: Date.now(),
    });
  }, [state.isOnline, state.isTesting, updateState, downloadTestUrl, uploadTestUrl, latencyTestUrl]);

  // --- BROWSER LISTENERS & POLLING ---

  useEffect(() => {
    const cleanup = setupBrowserListeners(updateState);
    return cleanup;
  }, [updateState]);

  useEffect(() => {
    if (pollInterval && pollInterval > 0 && state.isOnline) {
      const interval = setInterval(() => {
        runAllTests();
      }, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, state.isOnline, runAllTests]);

  // --- DERIVED STATE ---

  const contextValue = useMemo(() => {
    const speed = state.downloadSpeed;
    const customThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    
    let isPoor = false;
    let isGood = false;
    let isExcellent = false;
    let isThrottled = state.isThrottled; 

    if (speed !== null) {
      if (speed >= customThresholds.excellent) {
        isExcellent = true;
      } else if (speed >= customThresholds.good) {
        isGood = true;
      } 
      
      if (speed < customThresholds.poor) {
        isPoor = true;
      }
      
      if (speed < customThresholds.good) {
        isThrottled = true;
      } else {
        isThrottled = false;
      }
    }
    
    const isTestOnCooldown = state.lastTestTimestamp && (Date.now() - state.lastTestTimestamp) < TEST_COOLDOWN_MS;
    const isTestReady = !state.isTesting && !isTestOnCooldown;
    
    return {
      ...state,
      isPoor,
      isGood,
      isExcellent,
      isThrottled,
      isTestReady,
      runDownloadTest: runDownloadTestCb,
      runUploadTest: runUploadTestCb,
      runLatencyTest: runLatencyTestCb,
      runAllTests,
    };
  }, [state, thresholds, runDownloadTestCb, runUploadTestCb, runLatencyTestCb, runAllTests]);

  return (
    <ConnectivityContext.Provider value={contextValue}>
      {props.children}
    </ConnectivityContext.Provider>
  );
};