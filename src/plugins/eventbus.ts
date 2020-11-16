import mqtt from 'mqtt';
import { VueConstructor } from 'vue';
import Vue from 'vue';

import { HOSTNAME, PORT, WS_PROTOCOL } from '@/helpers/const';
import { popById } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { DatastoreEvent, StateEvent, StoreObject } from '@/shared-types';

const stateTopic = 'brewcast/state';
const datastoreTopic = 'brewcast/datastore';

export interface StateEventListener<T extends StateEvent> {
  id: string;
  filter: (key: string, type: string) => boolean;
  onmessage: (msg: T) => unknown;
}

export interface StoreEventListener {
  onChanged: (changed: StoreObject[]) => unknown;
  onDeleted: (deleted: string[]) => unknown;
}

export class BrewbloxEventbus {
  private stateListeners: StateEventListener<StateEvent>[] = [];

  public async start(): Promise<void> {
    const opts: mqtt.IClientOptions = {
      protocol: WS_PROTOCOL,
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
      if (body.length === 0) {
        return;
      }
      else if (topic.startsWith(datastoreTopic)) {
        const { changed, deleted }: DatastoreEvent = JSON.parse(body.toString());
        const database = Vue.$database;
        changed && database.onChanged(changed);
        deleted && database.onDeleted(deleted);
      }
      else if (topic.startsWith(stateTopic)) {
        const message: StateEvent = JSON.parse(body.toString());
        this.stateListeners
          .filter(lst => lst.filter(message.key, message.type))
          .forEach(lst => lst.onmessage(message));
      }
    });
  }

  public addStateListener<T extends StateEvent>(listener: StateEventListener<T>): void {
    if (this.stateListeners.find(lst => lst.id === listener.id)) {
      throw new Error(`State listener with id '${listener.id}' already exists`);
    }
    this.stateListeners.push(listener as StateEventListener<StateEvent>);
  }

  public removeStateListener(id: string): void {
    popById(this.stateListeners, { id });
  }
}

export default {
  install(Vue: VueConstructor) {
    Vue.$eventbus = new BrewbloxEventbus();
  },
};
