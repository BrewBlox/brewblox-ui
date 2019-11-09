import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import {
  Listener,
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
  public listeners: Mapped<Listener> = {};

  public get sessionIds(): string[] {
    return Object.keys(this.sessions);
  }

  public get sessionValues(): LoggedSession[] {
    return Object.values(this.sessions);
  }

  public get sessionById(): (id: string) => LoggedSession | null {
    return id => this.sessions[id] || null;
  }

  public get listenerIds(): string[] {
    return Object.keys(this.listeners);
  }

  public get listenerValues(): Listener[] {
    return Object.values(this.listeners);
  }

  public get measurements(): string[] {
    return Object.keys(this.fields);
  }

  public get listenerById(): (id: string) => Listener {
    return (id: string) => {
      const listener = this.listeners[id];
      if (listener === undefined) {
        throw new Error(`${id} not found in history store`);
      }
      return listener;
    };
  }

  public get tryListenerById(): (id: string) => Listener | null {
    return (id: string) => this.listeners[id] || null;
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
  public commitListener(listener: Listener): void {
    Vue.set(this.listeners, listener.id, listener);
  }

  @Mutation
  public commitRemoveListener(listener: Listener): void {
    Vue.delete(this.listeners, listener.id);
  }

  @Mutation
  public transform({ id, result }: { id: string; result: QueryResult }): void {
    const listener = this.listeners[id];
    if (listener !== undefined) {
      Vue.set(this.listeners, id, { ...listener.transformer(listener, result) });
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
  public async addListener(args: {
    listener: Listener;
    fetcher: (p: QueryParams, t: QueryTarget) => Promise<EventSource>;
  }): Promise<void> {
    const { listener, fetcher } = args;
    const { id, params, target } = listener;

    this.commitListener(listener);

    const source = await fetcher(params, target);
    source.onmessage = (event: MessageEvent) =>
      this.transform({ id, result: JSON.parse(event.data) });
    source.onerror = () => source.close();

    this.commitListener({ ...this.listeners[id], id, source });
  }

  @Action({ rawError })
  public async addValuesListener(listener: Listener): Promise<Listener> {
    await this.addListener({ listener, fetcher: historyApi.subscribeValues });
    return this.listeners[listener.id];
  }

  @Action({ rawError })
  public async addMetricsListener(listener: Listener): Promise<Listener> {
    await this.addListener({ listener, fetcher: historyApi.subscribeMetrics });
    return this.listeners[listener.id];
  }

  @Action({ rawError })
  public async removeListener(listener: Listener): Promise<void> {
    this.commitRemoveListener(listener);
    if (listener.source) {
      listener.source.close();
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
  public async setup(): Promise<void> {
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
