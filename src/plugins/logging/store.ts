import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import store from '@/store';

import { LogEntry } from './types';

@Module({ store, namespaced: true, dynamic: true, name: 'logging' })
export class LoggingModule extends VuexModule {
  public entries: LogEntry[] = [];

  @Mutation
  public commitEntry(entry: LogEntry): void {
    this.entries.push({ ...entry });
  }
}


export const loggingStore = getModule(LoggingModule);
