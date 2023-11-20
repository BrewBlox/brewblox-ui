import { defineStore } from 'pinia';
import { ref } from 'vue';

export type LogLevel = 'DEBUG' | 'INFO' | 'DONE' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  time: Date;
  message: string;
}

export const useLoggingStore = defineStore('loggingStore', () => {
  const entries = ref<LogEntry[]>([]);

  function addEntry(entry: LogEntry): void {
    entries.value.push({ ...entry });
  }

  return {
    entries,
    addEntry,
  };
});
