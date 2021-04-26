import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import {
  extendById,
  filterById,
  findById,
  isoDateString,
  uniqueFilter,
} from '@/utils/functional';
import notify from '@/utils/notify';

import type {
  ApiQuery,
  HistorySource,
  LoggedSession,
  QueryParams,
  QueryResult,
  QueryTarget,
} from '../types';
import { historyApi, sessionApi } from './api';


const buildQuery =
  (params: QueryParams, target: QueryTarget, epoch = 'ms'): ApiQuery =>
  ({
    database: params.database,
    start: isoDateString(params.start),
    end: isoDateString(params.end),
    duration: params.duration,
    limit: params.limit,
    order_by: params.orderBy,
    policy: params.policy,
    approx_points: params.approxPoints,
    measurement: target.measurement,
    fields: target.fields,
    epoch,
  });

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
        query: buildQuery(src.params, src.target),
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

  public sourceById(id: string | null): HistorySource | null {
    return findById(this.sources, id);
  }

  @Mutation
  public transform({ id, data }: { id: string; data: QueryResult }): void {
    const source = this.sourceById(id);
    if (source !== null) {
      this.sources = extendById(this.sources, source.transformer(source, data));
    }
  }

  @Mutation
  public setSource(source: HistorySource): void {
    this.sources = extendById(this.sources, source);
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
  public async removeSource(source: HistorySource): Promise<void> {
    this.endQuery(source);
    this.sources = filterById(this.sources, source);
  }

  @Action
  public async fetchFreshFields(): Promise<void> {
    this.freshFields = await historyApi.fetchFields(false);
  }

  @Action
  public async fetchAllFields(): Promise<void> {
    this.allFields = await historyApi.fetchFields(true);
  }

  @Action
  public async fetchValues([params, target, epoch]: [QueryParams, QueryTarget, string]): Promise<QueryResult> {
    return await historyApi.fetchValues(buildQuery(params, target, epoch));
  }

  @Action
  public async start(): Promise<void> {
    const onChange = (session: LoggedSession): void => {
      this.sessions = extendById(this.sessions, session);
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
