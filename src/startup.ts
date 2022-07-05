import { startupDone } from '@/user-settings';

export interface Startable {
  start(): Awaitable<unknown>;
}

/**
 * Vue/VueX have the concept of lifecycle hooks for individual components,
 * but no parallel at app level.
 *
 * It is a common use case for plugins or VueX stores to immediately fetch data.
 * `install()` functions for plugins are called before the Vue/VueX instances are created.
 * Inserting store data at that point will throw an error.
 *
 * As a solution, plugins can register callbacks here.
 * They will be called during App.vue setup.
 */
export class BrewbloxStartup {
  private startFuncs: (() => Awaitable<unknown>)[] = [];

  public add(startable: Startable): void {
    this.startFuncs.push(startable.start);
  }

  public async start(): Promise<void> {
    await Promise.all(this.startFuncs.map((f) => f()));
    startupDone.value = true;
  }
}

export const startup = new BrewbloxStartup();
