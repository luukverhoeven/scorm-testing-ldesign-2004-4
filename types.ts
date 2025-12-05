// SCORM 2004 API Interface
// In SCORM 2004, the API object is named "API_1484_11"
export interface Scorm2004API {
  Initialize(parameter: string): string;
  Terminate(parameter: string): string;
  GetValue(element: string): string;
  SetValue(element: string, value: string): string;
  Commit(parameter: string): string;
  GetLastError(): string;
  GetErrorString(errorCode: string): string;
  GetDiagnostic(errorCode: string): string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  result: string; // 'true', 'false', or value
  error?: string; // Error code if any
  type: 'info' | 'success' | 'error' | 'warning';
}

export enum ScormStatus {
  NOT_INITIALIZED = 'Not Initialized',
  INITIALIZED = 'Initialized',
  TERMINATED = 'Terminated',
  FAILED_TO_CONNECT = 'Failed to Connect',
}

export interface ScormState {
  completionStatus: string;
  successStatus: string;
  scoreRaw: string;
  scoreScaled: string;
  location: string;
  suspendData: string;
  exit: string;
  entry: string; // 'ab-initio', 'resume', or ''
  mode: string;  // 'normal', 'browse', 'review'
  
  // Learner Info
  learnerId: string;
  learnerName: string;
  credit: string; // 'credit' or 'no-credit'
  totalTime: string; // Total time from previous sessions
  launchData: string;
  language: string;
}