
export type LogLevel = 'DEBUG' | 'INFO' | 'DONE' | 'WARN' | 'ERROR'

export interface LogEntry {
  level: LogLevel;
  time: Date;
  message: string;
}
