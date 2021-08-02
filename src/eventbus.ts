import mqtt from 'mqtt';
import { nanoid } from 'nanoid';

import { HOSTNAME, IS_IOS, PORT, WS_PROTOCOL } from '@/const';
import { popById } from '@/utils/collections';
import { mqttTopicExp } from '@/utils/misc';
import { notify } from '@/utils/notify';

export type EventCallback = (topic: string, evt: any) => unknown;

export interface EventListener {
  id: string;
  topic: string;
  exp: RegExp;
  callback: EventCallback;
}

export class BrewbloxEventbus {
  private client: mqtt.MqttClient | null = null;
  private topics: Set<string> = new Set();
  private listeners: EventListener[] = [];

  public async connect(): Promise<void> {
    const opts: mqtt.IClientOptions = {
      protocol: WS_PROTOCOL,
      hostname: HOSTNAME,
      port: PORT,
      path: '/eventbus',
      rejectUnauthorized: false,
    };
    const client = mqtt.connect(undefined, opts);
    this.client = client;
    this.checkIOSBug();

    client.on('error', e => {
      notify.error(`mqtt error: ${e}`);
    });
    client.on('connect', () => {
      this.topics.forEach(topic => client.subscribe(topic));
    });
    client.on('message', (topic, body: Buffer) => {
      if (body.length === 0) {
        return;
      }
      const data = JSON.parse(body.toString());
      this.listeners
        .filter(listener => listener.exp.test(topic))
        .forEach(listener => listener.callback(topic, data));
    });
  }

  private checkIOSBug(): void {
    if (IS_IOS && WS_PROTOCOL === 'wss') {
      setTimeout(
        () => this.client?.connected || notify.error({
          timeout: 0,
          message: `
          Failed to connect to the eventbus.
          <a
            href="https://brewblox.netlify.app/user/troubleshooting.html#known-issues-workarounds"
            target="_blank"
            style="color: white"
          >
            This may be caused by an iOS bug.
          </a>
          `,
          html: true,
          actions: [
            {
              label: 'Dismiss',
              textColor: 'white',
            },
            {
              label: 'Switch to HTTP',
              textColor: 'white',
              handler: () => location.protocol = 'http:',
            },
          ],
        }),
        5000);
    }
  }

  public subscribe(topic: string): void {
    if (this.client?.connected && !this.topics.has(topic)) {
      this.client.subscribe(topic);
    }
    this.topics.add(topic);
  }

  public addListener(topic: string, callback: EventCallback): string {
    const id = nanoid();
    const exp = mqttTopicExp(topic);
    this.listeners.push({ id, topic, exp, callback });
    return id;
  }

  public removeListener(id: string): void {
    popById(this.listeners, { id });
  }

  public publish(topic: string, payload: Record<keyof any, any>): void {
    this.client?.publish(topic, JSON.stringify(payload));
  }
}

export const eventbus = new BrewbloxEventbus();
