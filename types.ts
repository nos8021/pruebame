export interface PDFFile {
  name: string;
  url: string;
  size: number;
}

export enum AppState {
  IDLE = 'IDLE',
  READING = 'READING',
  SCROLLING = 'SCROLLING'
}