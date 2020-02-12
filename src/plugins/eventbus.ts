import { VueConstructor } from 'vue';

import { popById } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { ReconnectingEventSource, sse } from '@/helpers/sse';

export type ListenerFunc = (msg: EventbusMessage) => void | Promise<void>;

export interface EventbusListener {
  id: string;
  filter: (key: string, type: string) => boolean;
  onmessage: (msg: EventbusMessage) => unknown;
}

export interface EventbusMessage {
  key: string;
  type: string;
  data: any;
}

/**
 * Backend services can push data over the RabbitMQ eventbus.
 * Events published to the brewcast.state exchange are forwarded over SSE.
 *
 * Plugins can set listeners for messages matching specific key(s).
 */
export class BrewbloxEventbus {
  private listeners: EventbusListener[] = [];
  private source: ReconnectingEventSource | null = null;
  private lastOk = true;

  public async start(): Promise<void> {
    this.source?.close();
    this.source = sse('/emitter/sse', 3000);

    this.source.onmessage = (event: MessageEvent) => {
      this.lastOk = true;
      const msg: EventbusMessage = JSON.parse(event.data);
      this.listeners
        .filter(lst => lst.filter(msg.key, msg.type))
        .forEach(lst => lst.onmessage(msg));
    };

    this.source.onerror = () => {
      if (this.lastOk) {
        notify.warn('Eventbus connection interrupted. Retrying...');
        this.lastOk = false;
      }
    };
  }

  public addListener(listener: EventbusListener): void {
    if (this.listeners.find(lst => lst.id === listener.id)) {
      throw new Error(`Listener with id '${listener.id}' already exists`);
    }
    this.listeners.push(listener);
  }

  public removeListener(id: string): void {
    popById(this.listeners, { id });
  }
}

export default {
  install(Vue: VueConstructor) {
    Vue.$eventbus = new BrewbloxEventbus();
  },
};
