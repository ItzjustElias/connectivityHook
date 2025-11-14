import React from 'react';

export interface NetworkInformationState {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
}

export interface Thresholds {
  excellent: number;
  good: number;
  poor: number;
}

export interface ConnectivityProviderProps {
  children: React.ReactNode;
  pollInterval?: number;
  downloadTestUrl?: string;
  uploadTestUrl?: string;
  latencyTestUrl?: string;
  thresholds?: Thresholds;
  initialState?: Partial<ConnectivityState>;
}

export interface TestManagement {
  runDownloadTest: () => Promise<void>;
  runUploadTest: () => Promise<void>;
  runLatencyTest: () => Promise<void>;
  runAllTests: () => Promise<void>;
  isTestReady: boolean;
}

export interface ConnectivityState extends NetworkInformationState, TestManagement {
  isSupported: boolean;
  isOnline: boolean;
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  latency: number | null;
  isTesting: boolean;
  isThrottled: boolean;
  isPoor: boolean;
  isGood: boolean;
  isExcellent: boolean;
  lastTestTimestamp: number | null;
}