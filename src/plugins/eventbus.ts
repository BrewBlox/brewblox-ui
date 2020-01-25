import { VueConstructor } from 'vue/types/umd';

import notify from '@/helpers/notify';
import { ReconnectingEventSource, sse } from '@/helpers/sse';

export type ListenerFunc = (msg: EventMessage) => void | Promise<void>;

export interface EventMessage {
  key: string;
  type: string;
  data: any;
}

export class BrewbloxEventbus {
  private listeners: Mapped<ListenerFunc> = {};
  private source: ReconnectingEventSource | null = null;
  private lastOk = true;

  public start(): void {
    this.source?.close();
    this.source = sse('/emitter/sse', 3000);

    this.source.onmessage = (event: MessageEvent) => {
      this.lastOk = true;
      const msg: EventMessage = JSON.parse(event.data);
      this.listeners[msg.key]?.(msg);
    };

    this.source.onerror = () => {
      if (this.lastOk) {
        notify.warn('Eventbus connection interrupted. Retrying...');
        this.lastOk = false;
      }
    };
  }

  public addListener(key: string, func: ListenerFunc): void {
    if (this.listeners[key]) {
      throw new Error(`Listener '${key}' already exists`);
    }
    this.listeners[key] = func;
  }

  public removeListener(key: string): void {
    if (this.listeners[key] !== undefined) {
      delete this.listeners[key];
    }
  }
}

export default {
  install(Vue: VueConstructor) {
    Vue.$eventbus = new BrewbloxEventbus();
  },
};
