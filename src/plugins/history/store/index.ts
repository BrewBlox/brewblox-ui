import Vue from 'vue';
import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { filterById } from '@/helpers/functional';
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
    return [...new Set(this.sessions.flatMap(session => session.tags ?? []))];
  }

  public get measurements(): string[] {
    return Object.keys(this.fields);
  }

  public sessionById(id: string): LoggedSession | null {
    return this.sessions.find(v => v.id === id) ?? null;
  }

  public sourceById(id: string): HistorySource | null {
    return this.sources.find(v => v.id === id) ?? null;
  }

  @Mutation
  public transform({ id, result }: { id: string; result: QueryResult }): void {
    const source = this.sourceById(id);
    if (source !== null) {
      Vue.set(this.sources, id, { ...source.transformer(source, result) });
    }
  }

  @Mutation
  public commitAllFields(fields: Mapped<string[]>): void {
    this.fields = { ...fields };
  }

  @Mutation
  public setSession(session: LoggedSession): void {
    this.sessions = filterById(this.sessions, session, true);
  }

  @Mutation
  public setSource(source: HistorySource): void {
    this.sources = filterById(this.sources, source, true);
  }

  @Action
  public async fetchSessions(): Promise<void> {
    this.sessions = await sessionApi.fetch();
  }

  @Action
  public async createSession(session: LoggedSession): Promise<void> {
    this.setSession(await sessionApi.create(session));
  }

  @Action
  public async saveSession(session: LoggedSession): Promise<void> {
    this.setSession(await sessionApi.persist(session));
  }

  @Action
  public async removeSession(session: LoggedSession): Promise<void> {
    await sessionApi.remove(session);
    this.sessions = filterById(this.sessions, session);
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
    this.commitAllFields(await historyApi.fetchKnownKeys());
  }

  @Action
  public async fetchValues([params, target]: [QueryParams, QueryTarget]): Promise<QueryResult> {
    return await historyApi.fetchValues(params, target);
  }

  @Action
  public async validateService(): Promise<boolean> {
    return await historyApi.validateService();
  }

  @Action
  public async start(): Promise<void> {
    const onChange = (session: LoggedSession): void => {
      const existing = this.sessionById(session.id);
      if (!existing || existing._rev !== session._rev) {
        this.setSession(session);
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
