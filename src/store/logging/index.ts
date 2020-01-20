import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import store from '@/store';

export type LogLevel = 'DEBUG' | 'INFO' | 'DONE' | 'WARN' | 'ERROR'

export interface LogEntry {
  level: LogLevel;
  time: Date;
  message: string;
}

@Module({ store, namespaced: true, dynamic: true, name: 'logging' })
export class LoggingModule extends VuexModule {
  public entries: LogEntry[] = [];

  @Mutation
  public commitEntry(entry: LogEntry): void {
    this.entries.push({ ...entry });
  }
}


export const loggingStore = getModule(LoggingModule);
