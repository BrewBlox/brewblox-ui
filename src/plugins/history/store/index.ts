import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import {
  HistorySource,
  LoggedSession,
  QueryParams,
  QueryResult,
  QueryTarget,
} from '../types';
import { historyApi, sessionApi } from './api';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'history' })
export class HistoryModule extends VuexModule {
  public sessions: Mapped<LoggedSession> = {};
  public fields: Mapped<string[]> = {};
  public sources: Mapped<HistorySource> = {};

  public get sessionIds(): string[] {
    return Object.keys(this.sessions);
  }

  public get sessionValues(): LoggedSession[] {
    return Object.values(this.sessions);
  }

  public get sessionById(): (id: string) => LoggedSession | null {
    return id => this.sessions[id] || null;
  }

  public get sessionTags(): string[] {
    return [...new Set(this.sessionValues.flatMap(session => session.tags ?? []))];
  }

  public get sourceIds(): string[] {
    return Object.keys(this.sources);
  }

  public get sourceValues(): HistorySource[] {
    return Object.values(this.sources);
  }

  public get measurements(): string[] {
    return Object.keys(this.fields);
  }

  public get sourceById(): (id: string) => HistorySource {
    return (id: string) => {
      const source = this.sources[id];
      if (source === undefined) {
        throw new Error(`${id} not found in history store`);
      }
      return source;
    };
  }

  public get trySourceById(): (id: string) => HistorySource | null {
    return (id: string) => this.sources[id] || null;
  }

  public get fieldsByMeasurement(): (measurement: string) => string[] {
    return (measurement: string) => this.fields[measurement];
  }

  @Mutation
  public commitSession(session: LoggedSession): void {
    Vue.set(this.sessions, session.id, session);
  }

  @Mutation
  public commitAllSessions(sessions: LoggedSession[]): void {
    this.sessions = sessions.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRemoveSession(session: LoggedSession): void {
    Vue.delete(this.sessions, session.id);
  }

  @Mutation
  public commitSource(source: HistorySource): void {
    Vue.set(this.sources, source.id, source);
  }

  @Mutation
  public commitRemoveSource(source: HistorySource): void {
    Vue.delete(this.sources, source.id);
  }

  @Mutation
  public transform({ id, result }: { id: string; result: QueryResult }): void {
    const source = this.sources[id];
    if (source !== undefined) {
      Vue.set(this.sources, id, { ...source.transformer(source, result) });
    }
  }

  @Mutation
  public commitAllFields(fields: Mapped<string[]>): void {
    this.fields = { ...fields };
  }

  @Action({ rawError })
  public async fetchSessions(): Promise<void> {
    this.commitAllSessions(await sessionApi.fetch());
  }

  @Action({ rawError })
  public async createSession(session: LoggedSession): Promise<void> {
    this.commitSession(await sessionApi.create(session));
  }

  @Action({ rawError })
  public async saveSession(session: LoggedSession): Promise<void> {
    this.commitSession(await sessionApi.persist(session));
  }

  @Action({ rawError })
  public async removeSession(session: LoggedSession): Promise<void> {
    await sessionApi.remove(session);
    this.commitRemoveSession(session);
  }

  @Action({ rawError })
  public async addSource(args: {
    source: HistorySource;
    fetcher: (p: QueryParams, t: QueryTarget) => Promise<EventSource>;
  }): Promise<void> {
    const { source, fetcher } = args;
    const { id, params, target } = source;

    this.commitSource(source);

    const events = await fetcher(params, target);
    events.onmessage = (event: MessageEvent) =>
      this.transform({ id, result: JSON.parse(event.data) });
    events.onerror = () => events.close();

    this.commitSource({ ...this.sources[id], id, events });
  }

  @Action({ rawError })
  public async addValuesSource(source: HistorySource): Promise<HistorySource> {
    await this.addSource({ source, fetcher: historyApi.subscribeValues });
    return this.sources[source.id];
  }

  @Action({ rawError })
  public async addMetricsSource(source: HistorySource): Promise<HistorySource> {
    await this.addSource({ source, fetcher: historyApi.subscribeMetrics });
    return this.sources[source.id];
  }

  @Action({ rawError })
  public async removeSource(source: HistorySource): Promise<void> {
    this.commitRemoveSource(source);
    if (source.events) {
      source.events.close();
    }
  }

  @Action({ rawError })
  public async fetchKnownKeys(): Promise<void> {
    this.commitAllFields(await historyApi.fetchKnownKeys());
  }

  @Action({ rawError })
  public async fetchValues([params, target]: [QueryParams, QueryTarget]): Promise<QueryResult> {
    return await historyApi.fetchValues(params, target);
  }

  @Action({ rawError })
  public async validateService(): Promise<boolean> {
    return await historyApi.validateService();
  }

  @Action({ rawError })
  public async start(): Promise<void> {
    const onChange = (session: LoggedSession): void => {
      const existing = this.sessionById(session.id);
      if (!existing || existing._rev !== session._rev) {
        this.commitSession(session);
      }
    };
    const onDelete = (id: string): void => {
      const existing = this.sessionById(id);
      if (existing) {
        this.commitRemoveSession(existing);
      }
    };

    this.commitAllSessions(await sessionApi.fetch());
    sessionApi.setup(onChange, onDelete);
  }
}

export const historyStore = getModule(HistoryModule);
