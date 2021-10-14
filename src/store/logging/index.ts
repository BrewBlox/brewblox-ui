import { defineStore } from 'pinia';

export type LogLevel = 'DEBUG' | 'INFO' | 'DONE' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  time: Date;
  message: string;
}

interface LoggingStoreState {
  entries: LogEntry[];
}

export const useLoggingStore = defineStore('loggingStore', {
  state: (): LoggingStoreState => ({
    entries: [],
  }),
  actions: {
    addEntry(entry: LogEntry): void {
      this.entries.push({ ...entry });
    },
  },
});
