import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import { concatById, filterById, findById } from '@/utils/collections';
import { isoDateString } from '@/utils/formatting';
import { uniqueFilter } from '@/utils/functional';
import { notify } from '@/utils/notify';

import type {
  ApiQuery,
  HistorySource,
  LoggedSession,
  QueryParams,
} from '../types';
import { historyApi, sessionApi } from './api';


function buildQuery(params: QueryParams, fields: string[]): ApiQuery {
  return {
    start: isoDateString(params.start),
    end: isoDateString(params.end),
    duration: params.duration,
    fields,
  };
}

@Module({ generateMutationSetters: true })
export class HistoryModule extends VuexModule {
  public sessions: LoggedSession[] = [];
  public freshFields: Mapped<string[]> = {};
  public allFields: Mapped<string[]> = {};
  public sources: HistorySource[] = [];

  private streamConnected = false;
  private stream: WebSocket | null = null;

  private startQuery(src: HistorySource): void {
    if (this.stream?.readyState === WebSocket.OPEN) {
      this.stream.send(JSON.stringify({
        id: src.id,
        command: src.command,
        query: buildQuery(src.params, src.fields),
      }));
    }
  }

  private endQuery(src: HistorySource): void {
    this.stream?.send(JSON.stringify({
      id: src.id,
      command: 'stop',
    }));
  }

  private connect(): void {
    this.stream = historyApi.openStream();
    this.stream.onopen = () => {
      this.streamConnected = true;
      this.sources.forEach(src => this.startQuery(src));
    };
    this.stream.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      data.error
        ? notify.error(`History error: ${event.data}`)
        : this.transform(data);
    };
    this.stream.onclose = () => {
      setTimeout(() => this.connect(), 2000);
    };
    this.stream.onerror = () => {
      if (this.streamConnected) {
        notify.error('History connection closed. Retrying...');
        this.streamConnected = false;
      }
      this.stream?.close();
      this.stream = null;
    };
  }

  public get sessionTags(): string[] {
    return this.sessions
      .flatMap(session => session.tags ?? [])
      .filter(uniqueFilter);
  }

  public sessionById(id: string | null): LoggedSession | null {
    return findById(this.sessions, id);
  }

  public sourceById<T extends HistorySource>(id: string | null): T | null {
    return findById(this.sources, id) as T | null;
  }

  @Mutation
  public transform({ id, data }: { id: string; data: any }): void {
    const source = this.sourceById(id);
    if (source !== null) {
      this.sources = concatById(this.sources, source.transformer(source, data));
    }
  }

  @Mutation
  public setSource(source: HistorySource): void {
    this.sources = concatById(this.sources, source);
  }

  @Action
  public async createSession(session: LoggedSession): Promise<void> {
    await sessionApi.create(session); // triggers callback
  }

  @Action
  public async saveSession(session: LoggedSession): Promise<void> {
    await sessionApi.persist(session); // triggers callback
  }

  @Action
  public async removeSession(session: LoggedSession): Promise<void> {
    await sessionApi.remove(session); // triggers callback
  }

  @Action
  public async addSource(source: HistorySource): Promise<void> {
    this.setSource(source);
    this.startQuery(source);
  }

  @Action
  public async removeSource(source: Maybe<HistorySource>): Promise<void> {
    if (source) {
      this.endQuery(source);
      this.sources = filterById(this.sources, source);
    }
  }

  @Action
  public async fetchFreshFields(): Promise<void> {
    const fields = await historyApi.fetchFields('1d');
    this.freshFields = fields
      .reduce(
        (acc: Mapped<string[]>, f: string) => {
          const [service, ...sections] = f.split('/');
          const arr = acc[service] ?? [];
          return { ...acc, [service]: [...arr, sections.join('/')] };
        },
        {},
      );
  }

  @Action
  public async fetchAllFields(): Promise<void> {
    const fields = await historyApi.fetchFields('');
    this.allFields = fields
      .reduce(
        (acc: Mapped<string[]>, f: string) => {
          const [service, ...sections] = f.split('/');
          const arr = acc[service] ?? [];
          return { ...acc, [service]: [...arr, sections.join('/')] };
        },
        {},
      );
  }

  // TODO(Bob): replace with dedicated CSV fetch
  // @Action
  // public async fetchValues([params, target, epoch]: [QueryParams, QueryTarget, string]): Promise<QueryResult> {
  //   return await historyApi.fetchValues(buildQuery(params, target, epoch));
  // }

  @Action
  public async start(): Promise<void> {
    const onChange = (session: LoggedSession): void => {
      this.sessions = concatById(this.sessions, session);
    };
    const onDelete = (id: string): void => {
      this.sessions = filterById(this.sessions, { id });
    };

    this.sessions = await sessionApi.fetch();
    sessionApi.subscribe(onChange, onDelete);

    this.connect();
  }
}

export const historyStore = new HistoryModule({ store, name: 'history' });
