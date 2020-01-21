import { VueConstructor } from 'vue/types/umd';

import { sse } from '@/helpers/fetch';

export type ListenerFunc<T = any> = (values: T) => void | Promise<void>;

export interface EmitterMessage {
  key: string;
  data: any;
}

export class EmitterClient {

  private listeners: Mapped<ListenerFunc> = {};
  private source: EventSource | null = null;
  private retryAction: NodeJS.Timeout | null = null;

  private scheduleRetry(): void {
    this.retryAction = setInterval(this.retry, 3000);
  }

  private cancelRetry(): void {
    if (this.retryAction !== null) {
      clearInterval(this.retryAction);
      this.retryAction = null;
    }
  }

  private retry(): void {
    if (this.source && this.source.readyState === EventSource.OPEN) {
      return;
    }

  }

  public listen(): void {

    this.source = sse('/emitter/sse');
    this.source.onopen = () => {
      this.cancelRetry();
    };
    this.source.onerror = () => {
      this.source?.close();
      this.source = null;
      this.scheduleRetry();
    };
    this.source.onmessage = (event: MessageEvent) => {
      const { key, data } = JSON.parse(event.data) as EmitterMessage;
      this.listeners[key]?.(data);
    };
  }
}


const client = new EmitterClient();

export default {
  install(Vue: VueConstructor): void {
    client.listen();
  },
};
