
export interface SpeedResult {
  ping: number;
  download: number;
  upload: number;
  timestamp: number;
}

export enum TestPhase {
  IDLE = 'IDLE',
  PING = 'PING',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  COMPLETED = 'COMPLETED'
}

export interface HistoryItem extends SpeedResult {
  id: string;
}
