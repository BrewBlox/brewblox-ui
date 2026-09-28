import axios from 'axios';
import { startupDone } from '@/user-settings';
import { parseHttpError } from '@/utils/http';
import { notify } from '@/utils/notify';

// A start that fails is tried again, after 1 s and 2 s
const START_ATTEMPTS = 3;
const START_RETRY_MS = 1000;

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
    await Promise.all(this.startFuncs.map((f) => startWithRetries(f)));
    startupDone.value = true;
  }
}

/**
 * Runs a start function, and tries it again after a failure,
 * such as a request that failed on a network change.
 * After the last attempt, it reports the error and gives up,
 * so the other stores and the eventbus still start:
 * one rejected start used to stop the whole app setup.
 * The start functions fetch before they subscribe, so a failed one left nothing behind.
 */
async function startWithRetries(
  start: () => Awaitable<unknown>,
): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await start();
      return;
    } catch (e) {
      if (attempt >= START_ATTEMPTS) {
        const reason = axios.isAxiosError(e) ? parseHttpError(e) : `${e}`;
        notify.error(
          `Failed to load data at startup: ${reason}. Reload the page to try again.`,
        );
        return;
      }
      await new Promise<void>((resolve) =>
        setTimeout(resolve, START_RETRY_MS * attempt),
      );
    }
  }
}

export const startup = new BrewbloxStartup();
