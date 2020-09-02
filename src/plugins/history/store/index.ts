import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { extendById, filterById, findById, uniqueFilter } from '@/helpers/functional';
import store from '@/store';

import {
  HistorySource,
  LoggedSession,
  QueryParams,
  QueryResult,
  QueryTarget,
} from '../types';
import { historyApi, sessionApi } from './api';

@Module({ generateMutationSetters: true })
export class HistoryModule extends VuexModule {
  public sessions: LoggedSession[] = [];
  public fields: Mapped<string[]> = {};
  public sources: HistorySource[] = [];

  public get sessionTags(): string[] {
    return this.sessions
      .flatMap(session => session.tags ?? [])
      .filter(uniqueFilter);
  }

  public get measurements(): string[] {
    return Object.keys(this.fields);
  }

  public sessionById(id: string): LoggedSession | null {
    return findById(this.sessions, id);
  }

  public sourceById(id: string): HistorySource | null {
    return findById(this.sources, id);
  }

  @Mutation
  public transform({ id, result }: { id: string; result: QueryResult }): void {
    const source = this.sourceById(id);
    if (source !== null) {
      this.sources = extendById(this.sources, source.transformer(source, result));
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
  public async addSource(args: {
    source: HistorySource;
    fetcher: (p: QueryParams, t: QueryTarget) => Promise<EventSource>;
  }): Promise<HistorySource> {
    const { source, fetcher } = args;
    const { id, params, target } = source;

    this.setSource(source);

    const events = await fetcher(params, target);
    events.onmessage = (event: MessageEvent) =>
      this.transform({ id, result: JSON.parse(event.data) });
    events.onerror = () => events.close();

    const updated = { ...this.sourceById(id)!, id, events };
    this.setSource(updated);
    return updated;
  }

  @Action
  public async addValuesSource(source: HistorySource): Promise<HistorySource> {
    return await this.addSource({ source, fetcher: historyApi.subscribeValues });
  }

  @Action
  public async addMetricsSource(source: HistorySource): Promise<HistorySource> {
    return await this.addSource({ source, fetcher: historyApi.subscribeMetrics });
  }

  @Action
  public async removeSource(source: HistorySource): Promise<void> {
    this.sources = filterById(this.sources, source);
    if (source.events) {
      source.events.close();
    }
  }

  @Action
  public async fetchKnownKeys(): Promise<void> {
    this.fields = await historyApi.fetchKnownKeys();
  }

  @Action
  public async fetchValues([params, target, epoch]: [QueryParams, QueryTarget, string]): Promise<QueryResult> {
    return await historyApi.fetchValues(params, target, epoch);
  }

  @Action
  public async validateService(): Promise<boolean> {
    return await historyApi.validateService();
  }

  @Action
  public async start(): Promise<void> {
    const onChange = (session: LoggedSession): void => {
      const existing = this.sessionById(session.id);
      if (!existing || existing._rev !== session._rev || session._rev === undefined) {
        this.sessions = extendById(this.sessions, session);
      }
    };
    const onDelete = (id: string): void => {
      this.sessions = filterById(this.sessions, { id });
    };

    this.sessions = await sessionApi.fetch();
    sessionApi.subscribe(onChange, onDelete);
  }
}

export const historyStore = new HistoryModule({ store, name: 'history' });
