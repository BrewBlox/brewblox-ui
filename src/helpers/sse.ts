import { HOST } from '@/helpers/const';

const { OPEN, CLOSED, CONNECTING } = EventSource;

export class ReconnectingEventSource {
  private readonly url: string;
  private readonly retryInterval: number;

  private readyState = CONNECTING;
  private source: EventSource | null = null;
  private timer: NodeJS.Timeout | null = null;

  public constructor(url: string, retryInterval: number) {
    this.url = url;
    this.retryInterval = retryInterval;
    this._start();
  }

  public close(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.source) {
      this.source.close();
      this.source = null;
    }

    this.readyState = CLOSED;
  }

  // may be replaced
  public onopen(event: Event): void {
    void event;
  }

  // may be replaced
  public onerror(event: Event): void {
    void event;
  }

  // may be replaced
  public onmessage(event: MessageEvent): void {
    void event;
  }

  private _start(): void {
    this.source = new EventSource(this.url);
    this.source.onopen = e => this._onopen(e);
    this.source.onerror = e => this._onerror(e);
    this.source.onmessage = e => this._onmessage(e);
  }

  private _onopen(event: Event): void {
    if (this.readyState === CONNECTING) {
      this.readyState = OPEN;
      this.onopen(event);
    }
  }

  private _onerror(event: Event): void {
    if (this.readyState === OPEN) {
      this.readyState = CONNECTING;
      this.onerror(event);
    }
    if (this.source?.readyState === CLOSED) {
      this.source.close();
      this.source = null;
      this.timer = setTimeout(() => this._start(), this.retryInterval);
    }
  }

  private _onmessage(event: MessageEvent): void {
    this.onmessage(event);
  }
}

export function sse(url: string): EventSource;
export function sse(url: string, retryInterval: number): ReconnectingEventSource;

export function sse(url: string, retryInterval?: number): EventSource | ReconnectingEventSource {
  return retryInterval !== undefined
    ? new ReconnectingEventSource(`${HOST}${url}`, retryInterval)
    : new EventSource(`${HOST}${url}`);
}
