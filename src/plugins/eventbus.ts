import mqtt from 'mqtt';
import { VueConstructor } from 'vue';

import { HOSTNAME, PORT } from '@/helpers/const';
import { popById } from '@/helpers/functional';
import notify from '@/helpers/notify';

const stateTopic = 'brewcast/state';
const datastoreTopic = 'brewcast/datastore';

export type StateListenerFunc = (msg: StateEventMessage) => void | Promise<void>;

export interface EventbusListener {
  id: string;
  filter: (key: string, type: string) => boolean;
  onmessage: (msg: StateEventMessage) => unknown;
}

export interface StateEventMessage {
  key: string;
  type: string;
  data: any;
}

export class BrewbloxEventbus {
  private stateListeners: EventbusListener[] = [];

  public async start(): Promise<void> {
    const opts: mqtt.IClientOptions = {
      protocol: 'wss',
      host: HOSTNAME,
      port: PORT,
      path: '/eventbus',
      rejectUnauthorized: false,
    };
    const client = mqtt.connect(undefined, opts);

    client.on('error', e => {
      notify.error(`mqtt error: ${e}`);
    });
    client.on('connect', () => {
      client.subscribe(stateTopic + '/#');
      client.subscribe(datastoreTopic + '/#');
    });
    client.on('message', (topic, body: Buffer) => {
      if (body.length === 0) { return; }
      else if (topic.startsWith(datastoreTopic)) {
        const message = JSON.parse(body.toString());

      }
      else if (topic.startsWith(stateTopic)) {
        const message: StateEventMessage = JSON.parse(body.toString());
        this.stateListeners
          .filter(lst => lst.filter(message.key, message.type))
          .forEach(lst => lst.onmessage(message));
      }
    });
  }

  public addListener(listener: EventbusListener): void {
    if (this.stateListeners.find(lst => lst.id === listener.id)) {
      throw new Error(`Listener with id '${listener.id}' already exists`);
    }
    this.stateListeners.push(listener);
  }

  public removeListener(id: string): void {
    popById(this.stateListeners, { id });
  }
}

export default {
  install(Vue: VueConstructor) {
    Vue.$eventbus = new BrewbloxEventbus();
  },
};
