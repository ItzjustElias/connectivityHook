# ConnectivityHook (React Network Connectivity Hook)
![alt text](https://img.shields.io/npm/d18m/connectivityhook.svg)

A lightweight, powerful, and comprehensive React hook and provider for monitoring real-time network status, browser Network Information API metrics, and manual internet speed (download, upload, latency) testing.

## 🚀 Features

* **Real-time Status:** Tracks `online`/`offline` status and browser network API metrics.
* **Speed Benchmarking:** Manual methods to test Download Speed, Upload Speed, and Latency (Ping).
* **Derived State:** Automatically calculates quality flags like `isPoor`, `isGood`, and `isExcellent`.
* **Full TypeScript Support:** Ships with dedicated type declarations.

## 📦 Installation

This package requires **React >= 16.8.0**.

```bash
npm install connectivityhook
# or
yarn add connectivityhook
```

## 💡 Quick Start
Wrap your application in the ConnectivityProvider.

```JavaScript

import React from 'react';
import { ConnectivityProvider, useConnectivity } from 'connectivityhook';

const NetworkStatusDisplay = () => {
  const { 
    isOnline, 
    downloadSpeed, 
    latency, 
    isTesting, 
    runAllTests 
  } = useConnectivity();
  
  return (
    <div>
      <h2>Status: {isOnline ? "Online" : "Offline"}</h2>
      <p>Download Speed: {downloadSpeed !== null ? `${downloadSpeed.toFixed(2)} Mbps` : 'N/A'}</p>
      <button 
        onClick={runAllTests} 
        disabled={isTesting}
      >
        {isTesting ? 'Testing...' : 'Run Speed Test'}
      </button>
    </div>
  );
};

const App = () => (
  <ConnectivityProvider>
    <NetworkStatusDisplay />
  </ConnectivityProvider>
);

export default App;
```

## ⚙️ Advanced Configuration (ConnectivityProviderProps)
The ConnectivityProvider accepts optional props to customize behavior and benchmark settings, such as pollInterval and thresholds.

## 🎣 The useConnectivity Hook
The hook returns a single object containing metrics (e.g., downloadSpeed, latency, effectiveType) and test management methods (e.g., runAllTests(), runDownloadTest()