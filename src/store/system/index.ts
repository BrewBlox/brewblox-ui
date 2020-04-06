import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';

@Module
export class SystemModule extends VuexModule {
  public now: Date = new Date();

  @Mutation
  public updateTime(): void {
    this.now = new Date();
  }

  @Action
  public async start(): Promise<void> {
    // Every time updateTime() is called, it will trigger a reactive update.
    setInterval(() => this.updateTime(), 10 * 1000);
  }
}

export const systemStore = new SystemModule({ store, name: 'system' });
