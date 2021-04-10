import { Plugin } from 'vue';

import { StartupKey } from '@/symbols';

/**
 * Vue/VueX have the concept of lifecycle hooks for individual components,
 * but no parallel at app level.
 *
 * It is a common use case for plugins or VueX stores to immediately fetch data.
 * `install()` functions for plugins are called before the Vue/VueX instances are created.
 * Inserting store data at that point will throw an error.
 *
 * As a solution, plugins can register callbacks here.
 * They will be called in the App.vue `created()` hook.
 */
export class BrewbloxStartup {
  private startFuncs: (() => Awaitable<unknown>)[] = [];

  public onStart(func: (() => Awaitable<unknown>)): void {
    this.startFuncs.push(func);
  }

  public async start(): Promise<void> {
    await Promise.all(this.startFuncs.map(f => f()));
  }
}

export const startup = new BrewbloxStartup();

export const startupPlugin: Plugin = {
  install(app) {
    app.provide(StartupKey, startup);
  },
};
