import Vue from 'vue';
import store from '@/store';
import { Module, VuexModule, Mutation, Action, getModule } from 'vuex-module-decorators';
import { Listener, QueryResult, QueryParams, QueryTarget } from './state';
import {
  fetchKnownKeys as fetchKnownKeysInApi,
  validateService as validateServiceInApi,
  subscribeMetrics,
  subscribeValues,
} from './api';


@Module({ store, namespaced: true, dynamic: true, name: 'history' })
export class HistoryModule extends VuexModule {
  public fields: Record<string, string[]> = {};
  public listeners: Record<string, Listener> = {};

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
  public commitAllFields(fields: Record<string, string[]>): void {
    this.fields = { ...fields };
  }

  @Action
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

  @Action
  public async addValuesListener(listener: Listener): Promise<Listener> {
    await this.addListener({ listener, fetcher: subscribeValues });
    return this.listeners[listener.id];
  }

  @Action
  public async addMetricsListener(listener: Listener): Promise<Listener> {
    await this.addListener({ listener, fetcher: subscribeMetrics });
    return this.listeners[listener.id];
  }

  @Action
  public async removeListener(listener: Listener): Promise<void> {
    this.commitRemoveListener(listener);
    if (listener.source) {
      listener.source.close();
    }
  }

  @Action({ commit: 'commitAllFields' })
  public async fetchKnownKeys(): Promise<Record<string, string[]>> {
    return await fetchKnownKeysInApi();
  }

  @Action
  public async validateService(): Promise<boolean> {
    return await validateServiceInApi();
  }
}

export default getModule(HistoryModule);
