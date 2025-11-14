export const TEST_COOLDOWN_MS = 15000;
export const TEST_CHUNK_SIZE_BYTES = 1048576; 
export const DEFAULT_THRESHOLDS = {
  excellent: 25,
  good: 5,
  poor: 1,
};
export const DEFAULT_DOWNLOAD_URL = 'https://placehold.co/100x100/CCCCCC/FFFFFF/png';
export const DEFAULT_UPLOAD_URL = '/api/upload-test'; 
export const DEFAULT_LATENCY_URL = 'https://placehold.co/1x1/CCCCCC/FFFFFF/png';

const bytesToMbps = (bytes: number, durationSeconds: number): number => {
  const bits = bytes * 8;
  return (bits / durationSeconds) / 1024 / 1024;
};

export async function runDownloadTest(url: string, testSizeBytes: number): Promise<number | null> {
  try {
    const startTime = performance.now();
    const response = await fetch(`${url}?cache=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Download test failed: ${response.status}`);
    const data = await response.arrayBuffer();
    const endTime = performance.now();
    const downloadedBytes = data.byteLength || testSizeBytes;
    const durationSeconds = (endTime - startTime) / 1000;
    return bytesToMbps(downloadedBytes, durationSeconds);
  } catch (error) {
    return null;
  }
}

export async function runUploadTest(url: string, testSizeBytes: number): Promise<number | null> {
  try {
    const payload = new Uint8Array(testSizeBytes); 
    const startTime = performance.now();
    const response = await fetch(`${url}?cache=${Date.now()}`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/octet-stream' },
      body: payload,
    });
    if (!response.ok) throw new Error(`Upload test failed: ${response.status}`);
    const endTime = performance.now();
    const uploadedBytes = testSizeBytes;
    const durationSeconds = (endTime - startTime) / 1000;
    return bytesToMbps(uploadedBytes, durationSeconds);
  } catch (error) {
    return null;
  }
}

export async function runLatencyTest(url: string): Promise<number | null> {
  try {
    const startTime = performance.now();
    const response = await fetch(`${url}?cache=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
    if (!response.ok) throw new Error(`Latency test failed: ${response.status}`);
    const endTime = performance.now();
    return endTime - startTime;
  } catch (error) {
    return null;
  }
}