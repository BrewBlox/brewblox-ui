import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import { deserialize } from '@/helpers/units/parseObject';
import store from '@/store';

import { Process, Runtime } from '../types';
import { processApi, runtimeApi } from './api';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'automation' })
export class AutomationModule extends VuexModule {
  public processes: Mapped<Process> = {};
  public runtimes: Mapped<Runtime> = {};

  public source: EventSource | null = null;
  public lastUpdate = 0;

  public get processIds(): string[] {
    return Object.keys(this.processes);
  }

  public get processValues(): Process[] {
    return Object.values(this.processes);
  }

  public get processById(): (id: string) => Process {
    return id => this.processes[id] || null;
  }

  public get runtimeIds(): string[] {
    return Object.keys(this.runtimes);
  }

  public get runtimeValues(): Runtime[] {
    return Object.values(this.runtimes);
  }

  public get runtimeById(): (id: string) => Runtime {
    return id => this.runtimes[id] || null;
  }

  @Mutation
  public commitProcess(process: Process): void {
    Vue.set(this.processes, process.id, process);
  }

  @Mutation
  public commitRemoveProcess(process: Process): void {
    Vue.delete(this.processes, process.id);
  }

  @Mutation
  public commitAllProcesses(processes: Process[]): void {
    this.processes = processes.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitRuntime(runtime: Runtime): void {
    Vue.set(this.runtimes, runtime.id, runtime);
  }

  @Mutation
  public commitRemoveRuntime(runtime: Process | Runtime): void {
    Vue.delete(this.runtimes, runtime.id);
  }

  @Mutation
  public commitAllRuntimes(runtimes: Runtime[]): void {
    this.runtimes = runtimes.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitSource(source: EventSource | null): void {
    this.source = source;
    if (source === null) {
      this.lastUpdate = this.lastUpdate <= 0 ? this.lastUpdate - 1 : 0;
    }
  }

  @Mutation
  public commitLastUpdate(): void {
    this.lastUpdate = new Date().getTime();
  }

  @Action({ rawError })
  public async fetchProcesses(): Promise<void> {
    this.commitAllProcesses(await processApi.fetch());
  }

  @Action({ rawError })
  public async createProcess(process: Process): Promise<void> {
    this.commitProcess(await processApi.create(process));
  }

  @Action({ rawError })
  public async saveProcess(process: Process): Promise<void> {
    this.commitProcess(await processApi.persist(process));
  }

  @Action({ rawError })
  public async removeProcess(process: Process): Promise<void> {
    await processApi.remove(process);
    this.commitRemoveProcess(process);
  }

  @Action({ rawError })
  public async subscribe(): Promise<void> {
    try {
      const source = await runtimeApi.subscribe();

      source.onmessage = (event: MessageEvent) => {
        const runtimes: Runtime[] = deserialize(JSON.parse(event.data));
        this.commitAllRuntimes(runtimes);
        this.commitLastUpdate();
      };

      source.onerror = () => {
        source.close();
        this.commitSource(null);
      };

      this.commitSource(source);
    } catch (e) {
      this.commitSource(null);
    }
  }

  @Action({ rawError })
  public async fetchRuntimes(): Promise<void> {
    this.commitAllRuntimes(await runtimeApi.fetch());
  }

  @Action({ rawError })
  public async startRuntime(process: Process): Promise<void> {
    this.commitRuntime(await runtimeApi.start(process));
  }

  @Action({ rawError })
  public async stopRuntime(runtime: Runtime): Promise<void> {
    this.commitRuntime(await runtimeApi.stop(runtime));
  }

  @Action({ rawError })
  public async advanceRuntime(runtime: Runtime): Promise<void> {
    this.commitRuntime(await runtimeApi.advance(runtime));
  }

  @Action({ rawError })
  public async exitRuntime(runtime: Runtime): Promise<void> {
    await runtimeApi.exit(runtime);
    this.commitRemoveRuntime(runtime);
  }

  @Action({ rawError })
  public async start(): Promise<void> {
    const onChange = (process: Process): void => {
      const existing = this.processById(process.id);
      if (!existing || existing._rev !== process._rev) {
        this.commitProcess(process);
      }
    };
    const onDelete = (id: string): void => {
      const existing = this.processById(id);
      if (existing) {
        this.commitRemoveProcess(existing);
      }
    };

    this.commitAllProcesses(await processApi.fetch());
    this.commitAllRuntimes(await runtimeApi.fetch());

    processApi.subscribe(onChange, onDelete);
  }
}

export const automationStore = getModule(AutomationModule);
