import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import { Process, Runtime } from '../types';
import * as api from './api';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'stepper' })
export class StepperModule extends VuexModule {
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

  public get runtimeIds(): string[] {
    return Object.keys(this.runtimes);
  }

  public get runtimeValues(): Runtime[] {
    return Object.values(this.runtimes);
  }

  @Mutation
  public commitProcess(process: Process): void {
    Vue.set(this.processes, process.id, process);
  }

  @Mutation
  public commitRemoveProcess(process: Process): void {
    Vue.delete(this.processes, process.id);
    Vue.delete(this.runtimes, process.id);
  }

  @Mutation
  public commitAllProcesses(processes: Process[]): void {
    const ids = processes.map(p => p.id);
    const reducer = objReducer('id');

    this.processes = processes
      .reduce(reducer, {});
    this.runtimes = Object.values(this.runtimes)
      .filter(r => ids.includes(r.id))
      .reduce(reducer, {});
  }

  @Mutation
  public commitAll([processes, runtimes]): void {
    const reducer = objReducer('id');
    this.processes = processes.reduce(reducer, {});
    this.runtimes = runtimes.reduce(reducer, {});
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
  public async fetchAll(): Promise<void> {
    this.commitAll(
      await Promise.all([
        api.fetchProcesses(),
        api.fetchRuntimes(),
      ])
    );
  }

  @Action({ rawError })
  public async fetchProcesses(): Promise<void> {
    this.commitAllProcesses(await api.fetchProcesses());
  }

  @Action({ rawError })
  public async createProcess(process: Process): Promise<void> {
    if (this.processes[process.id]) {
      throw new Error((`Process ${process.id} already exists`));
    }
    this.commitProcess(await api.createProcess(process));
  }

  @Action({ rawError })
  public async saveProcess(process: Process): Promise<void> {
    this.commitProcess(await api.persistProcess(process));
  }

  @Action({ rawError })
  public async removeProcess(process: Process): Promise<void> {
    await api.removeProcess(process);
    this.commitRemoveProcess(process);
  }

  @Action({ rawError })
  public async clearProcesses(): Promise<void> {
    await api.clearProcesses();
    this.commitAllProcesses([]);
  }

  @Action({ rawError })
  public async fetchRuntime(process: Process | Runtime): Promise<void> {
    this.commitRuntime(await api.fetchRuntime(process));
  }

  @Action({ rawError })
  public async subscribe(): Promise<void> {
    try {
      await this.fetchProcesses();
      const source = await api.subscribe();

      source.onmessage = (event: MessageEvent) => {
        const runtimes: Runtime[] = JSON.parse(event.data);
        this.commitAllRuntimes(runtimes);
        this.commitLastUpdate();
        runtimes
          .filter(runtime => !this.processes[runtime.id])
          .forEach(runtime => api.fetchProcess(runtime).then(this.commitProcess));
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
  public async startProcess(process: Process): Promise<void> {
    this.commitRuntime(await api.startProcess(process));
  }

  @Action({ rawError })
  public async advanceProcess(process: Runtime | Process): Promise<void> {
    this.commitRuntime(await api.advanceProcess(process));
  }

  @Action({ rawError })
  public async exitProcess(process: Process | Runtime): Promise<void> {
    await api.exitRuntime(process);
    this.commitRemoveRuntime(process);
  }
}

export const stepperStore = getModule(StepperModule);
