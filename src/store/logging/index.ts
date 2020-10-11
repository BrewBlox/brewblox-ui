import { Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';

export type LogLevel = 'DEBUG' | 'INFO' | 'DONE' | 'WARN' | 'ERROR'

export interface LogEntry {
  level: LogLevel;
  time: Date;
  message: string;
}

@Module
export class LoggingModule extends VuexModule {
  public entries: LogEntry[] = [];

  @Mutation
  public addEntry(entry: LogEntry): void {
    this.entries.push({ ...entry });
  }
}


export const loggingStore = new LoggingModule({ store, name: 'logging' });
