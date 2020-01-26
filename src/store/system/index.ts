import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import store from '@/store';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'system' })
export class SystemModule extends VuexModule {
  public now: Date = new Date();

  @Mutation
  public updateTime(): void {
    this.now = new Date();
  }

  @Action({ rawError })
  public async start(): Promise<void> {
    // Every time updateTime() is called, it will trigger a reactive update.
    setInterval(() => this.updateTime(), 10 * 1000);
  }
}

export const systemStore = getModule(SystemModule);
