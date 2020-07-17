import mqtt from 'mqtt';
import { VueConstructor } from 'vue';

import { HOSTNAME, PORT } from '@/helpers/const';
import { popById } from '@/helpers/functional';
import notify from '@/helpers/notify';
const stateTopic = 'brewcast/state';

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

export class BrewbloxEventbus {
  private listeners: EventbusListener[] = [];
  private startup = false;

  public async start(): Promise<void> {
    const opts: mqtt.IClientOptions = {
      protocol: 'wss',
      host: HOSTNAME,
      port: PORT,
      path: '/eventbus',
      rejectUnauthorized: false,
    };
    const client = mqtt.connect(undefined, opts);

    client.on('error', e => notify.error(`mqtt error: ${e}`));
    client.on('connect', () => {
      client.subscribe(stateTopic + '/#');
      if (!this.startup) {
        client.publish('brewcast/request/state', '{}');
        this.startup = true;
      }
    });
    client.on('message', (_, body: Buffer) => {
      if (body.length === 0) { return; }
      const message: EventbusMessage = JSON.parse(body.toString());
      this.listeners
        .filter(lst => lst.filter(message.key, message.type))
        .forEach(lst => lst.onmessage(message));
    });
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
