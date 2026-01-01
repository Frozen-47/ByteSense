
/**
 * Speed Test Service
 * Uses Cloudflare edge endpoints for accurate measurements.
 */

const PING_ENDPOINT = 'https://cloudflare.com/cdn-cgi/trace';
const DOWNLOAD_ENDPOINT = 'https://speed.cloudflare.com/__down';
const UPLOAD_ENDPOINT = 'https://speed.cloudflare.com/__up';

export const testPing = async (): Promise<number> => {
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    try {
      await fetch(PING_ENDPOINT, { 
        method: 'HEAD', 
        cache: 'no-cache',
        mode: 'no-cors' 
      });
      samples.push(performance.now() - start);
    } catch (e) {
      console.error('Ping iteration failed', e);
    }
  }
  return samples.length > 0 
    ? Math.round(samples.reduce((a, b) => a + b) / samples.length) 
    : 0;
};

export const testDownload = async (onProgress?: (mbps: number) => void): Promise<number> => {
  // Test with various sizes: 1MB, 5MB, 10MB
  const sizes = [1048576, 5242880, 10485760]; 
  let maxSpeed = 0;

  for (const size of sizes) {
    const start = performance.now();
    try {
      const response = await fetch(`${DOWNLOAD_ENDPOINT}?bytes=${size}`, { 
        cache: 'no-cache' 
      });
      await response.arrayBuffer();
      const durationSeconds = (performance.now() - start) / 1000;
      const bitsLoaded = size * 8;
      const mbps = (bitsLoaded / durationSeconds) / (1024 * 1024);
      
      maxSpeed = Math.max(maxSpeed, mbps);
      if (onProgress) onProgress(mbps);
    } catch (e) {
      console.error('Download size test failed', size, e);
    }
  }
  return Math.round(maxSpeed * 10) / 10;
};

export const testUpload = async (onProgress?: (mbps: number) => void): Promise<number> => {
  // Sizes: 512KB, 1MB, 2MB
  const sizes = [524288, 1048576, 2097152];
  let maxSpeed = 0;

  for (const size of sizes) {
    const data = new Uint8Array(size);
    const start = performance.now();
    try {
      await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: data,
        cache: 'no-cache',
        mode: 'no-cors'
      });
      const durationSeconds = (performance.now() - start) / 1000;
      const bitsUploaded = size * 8;
      const mbps = (bitsUploaded / durationSeconds) / (1024 * 1024);
      
      maxSpeed = Math.max(maxSpeed, mbps);
      if (onProgress) onProgress(mbps);
    } catch (e) {
      console.error('Upload size test failed', size, e);
    }
  }
  return Math.round(maxSpeed * 10) / 10;
};
