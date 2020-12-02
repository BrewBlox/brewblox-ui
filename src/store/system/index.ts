import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';

@Module // generateMutationSetters not set
export class SystemModule extends VuexModule {
  public experimental: boolean = false;
  public now: Date = new Date();

  @Mutation
  public updateTime(): void {
    this.now = new Date();
  }

  @Mutation
  public setExperimental(value: boolean | null): void {
    if (value !== null) {
      this.experimental = value;
      localStorage.setItem('experimental', `${value}`);
    }
    else {
      this.experimental = (localStorage.getItem('experimental') === 'true');
    }
  }

  @Action
  public async start(): Promise<void> {
    // Every time updateTime() is called, it will trigger a reactive update.
    setInterval(() => this.updateTime(), 10 * 1000);
    this.setExperimental(null);
  }
}

export const systemStore = new SystemModule({ store, name: 'system' });
