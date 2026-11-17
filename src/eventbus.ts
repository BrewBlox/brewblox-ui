import mqtt from 'mqtt';
import { nanoid } from 'nanoid';
import { Ref, ref } from 'vue';
import { HOSTNAME, IS_IOS, PORT, WS_PROTOCOL } from '@/const';
import { popById } from '@/utils/collections';
import { mqttTopicExp } from '@/utils/misc';
import { notify } from '@/utils/notify';
import { workerInterval } from '@/utils/worker-interval';
import { createDialog } from './utils/dialog';

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
  private connectCallbacks: (() => unknown)[] = [];
  public readonly connected: Ref<boolean> = ref(false);

  public async connect(): Promise<void> {
    const opts: mqtt.IClientOptions = {
      protocol: WS_PROTOCOL,
      hostname: HOSTNAME,
      port: PORT,
      path: '/eventbus',
      rejectUnauthorized: false,
      reschedulePings: false,
      // mqtt's own worker timers can fire every keepalive at once: see workerInterval
      timerVariant: workerInterval,
      // The connect handler subscribes, and is called back once the broker acknowledged it
      resubscribe: false,
    };
    if (this.client) {
      this.client.end();
    }
    const client = mqtt.connect(opts);
    this.client = client;
    this.checkIOSBug();

    client.on('error', (e) => {
      notify.error(`mqtt error: ${e}`);
    });
    client.on('connect', () => {
      this.connected.value = true;
      const topics = [...this.topics];
      // Messages published before the broker acknowledged the subscriptions are not received
      if (topics.length) {
        client.subscribe(topics, () => this.runConnectCallbacks());
      } else {
        this.runConnectCallbacks();
      }
    });
    client.on('close', () => {
      this.connected.value = false;
    });
    client.on('message', (topic, body: Buffer) => {
      if (body.length === 0) {
        return;
      }
      // The MQTT client calls this handler synchronously while parsing packets.
      // An uncaught error here stalls all further message handling.
      let data: any;
      try {
        data = JSON.parse(body.toString());
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Invalid JSON on topic '${topic}':`, e);
        return;
      }
      this.listeners
        .filter((listener) => listener.exp.test(topic))
        .forEach((listener) => {
          try {
            listener.callback(topic, data);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Error handling message on topic '${topic}':`, e);
          }
        });
    });
  }

  private checkIOSBug(): void {
    if (IS_IOS && WS_PROTOCOL === 'wss') {
      setTimeout(
        () =>
          this.client?.connected ||
          notify.error({
            timeout: 0,
            message: `
          Failed to connect to the eventbus.
          <a
            href="https://brewblox.com/user/troubleshooting.html#known-issues-workarounds"
            target="_blank"
            style="color: white"
          >
            Self-signed SSL certificates are a known problem on iOS.
          </a>
          `,
            html: true,
            actions: [
              {
                label: 'Dismiss',
                textColor: 'white',
              },
              {
                label: 'Install SSL Cert',
                textColor: 'white',
                handler: () => createDialog({ component: 'SslCertDialog' }),
              },
            ],
          }),
        5000,
      );
    }
  }

  public subscribe(topic: string): void {
    if (this.client?.connected && !this.topics.has(topic)) {
      this.client.subscribe(topic);
    }
    this.topics.add(topic);
  }

  private runConnectCallbacks(): void {
    this.connectCallbacks.forEach((cb) =>
      Promise.resolve()
        .then(cb)
        .catch((e) => notify.error(`Error after the eventbus connected: ${e}`)),
    );
  }

  /**
   * Called whenever the eventbus connects, the first time included:
   * messages published while it was not connected were not received.
   */
  public onConnect(cb: () => unknown): void {
    this.connectCallbacks.push(cb);
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
