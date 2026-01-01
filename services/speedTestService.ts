/**
 * Speed Test Service
 * Uses Cloudflare edge endpoints for measurements.
 * Note: These endpoints may be CORS-restricted. For production, consider using a proxy
 * or a dedicated speed test backend.
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
  // Use a single large file for streaming measurement instead of small chunks
  // 50MB should be enough to ramp up speed
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
      
      // Calculate instantaneous speed
      if (durationSeconds > 0) {
        const bitsLoaded = receivedLength * 8;
        // Standard Mbps is 10^6, not 2^20
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
  // Use XHR for upload progress tracking (fetch doesn't support it yet)
  const size = 10485760; // 10MB
  const data = new Uint8Array(size); // Dummy data
  let maxSpeed = 0;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const start = performance.now();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const currentTime = performance.now();
        const durationSeconds = (currentTime - start) / 1000;
        
        if (durationSeconds > 0) {
          const bitsUploaded = event.loaded * 8;
          const mbps = (bitsUploaded / durationSeconds) / 1000000;
          
          maxSpeed = Math.max(maxSpeed, mbps);
          if (onProgress) onProgress(Math.round(mbps * 10) / 10);
        }
      }
    };

    xhr.open('POST', UPLOAD_ENDPOINT, true);
    // Cloudflare might require specific headers or handle generic POSTs
    // mode: 'no-cors' equivalent isn't direct in XHR, but we can try just sending
    
    xhr.onload = () => {
      resolve(Math.round(maxSpeed * 10) / 10);
    };

    xhr.onerror = (e) => {
      console.error('Upload test failed', e);
      resolve(Math.round(maxSpeed * 10) / 10);
    };

    xhr.send(data);
  });
};