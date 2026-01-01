/**
 * Speed Test Service
 * Uses Cloudflare edge endpoints for measurements.
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
  // 50MB file for streaming measurement
  const size = 52428800; 
  let maxSpeed = 0;
  let receivedLength = 0;
  const start = performance.now();

  try {
    const response = await fetch(`${DOWNLOAD_ENDPOINT}?bytes=${size}`, { 
      cache: 'no-cache'
    });

    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedLength += value.length;
      const currentTime = performance.now();
      const durationSeconds = (currentTime - start) / 1000;
      
      if (durationSeconds > 0) {
        const bitsLoaded = receivedLength * 8;
        const mbps = (bitsLoaded / durationSeconds) / 1000000; 
        
        maxSpeed = Math.max(maxSpeed, mbps);
        if (onProgress) onProgress(Math.round(mbps * 10) / 10);
      }
    }
  } catch (e) {
    console.error('Download test failed', e);
  }

  return Math.round(maxSpeed * 10) / 10;
};

export const testUpload = async (onProgress?: (mbps: number) => void): Promise<number> => {
  // Use iterative uploads with no-cors to bypass CORS restrictions on localhost
  // Sizes: 100KB, 500KB, 2MB, 5MB
  const sizes = [102400, 512000, 2097152, 5242880];
  let maxSpeed = 0;

  for (const size of sizes) {
    // Generate random data to prevent compression
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i += 1024) {
       data[i] = Math.floor(Math.random() * 255);
    }

    const start = performance.now();
    try {
      await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: data,
        mode: 'no-cors', // Important: allows upload even if server blocks CORS
        cache: 'no-cache',
      });

      const durationSeconds = (performance.now() - start) / 1000;
      
      // Filter out instant responses (cached or anomalies)
      if (durationSeconds > 0.05) {
        const bitsUploaded = size * 8;
        const mbps = (bitsUploaded / durationSeconds) / 1000000;
        
        if (mbps > maxSpeed) maxSpeed = mbps;
        if (onProgress) onProgress(Math.round(mbps * 10) / 10);
      }
    } catch (e) {
      // Continue to next size even if one fails
      console.warn('Upload iteration failed', e);
    }
  }

  return Math.round(maxSpeed * 10) / 10;
};