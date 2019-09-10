import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import { Process, Runtime, RuntimeStatus } from '../types';
import * as api from './api';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'stepper' })
export class StepperModule extends VuexModule {
  public processes: Mapped<Process> = {};
  public runtimes: Mapped<Runtime> = {};
  public statuses: Mapped<RuntimeStatus> = {};

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

  public get statusIds(): string[] {
    return Object.keys(this.statuses);
  }

  public get statusValues(): RuntimeStatus[] {
    return Object.values(this.statuses);
  }

  @Mutation
  public commitProcess(process: Process): void {
    Vue.set(this.processes, process.id, process);
  }

  @Mutation
  public commitRemoveProcess(process: Process): void {
    Vue.delete(this.processes, process.id);
    Vue.delete(this.runtimes, process.id);
    Vue.delete(this.statuses, process.id);
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
    this.statuses = Object.values(this.statuses)
      .filter(s => ids.includes(s.id))
      .reduce(reducer, {});
  }

  @Mutation
  public commitAll([processes, runtimes, statuses]): void {
    const reducer = objReducer('id');
    this.processes = processes.reduce(reducer, {});
    this.runtimes = runtimes.reduce(reducer, {});
    this.statuses = statuses.reduce(reducer, {});
  }

  @Mutation
  public commitRuntime(runtime: Runtime): void {
    Vue.set(this.runtimes, runtime.id, runtime);
  }

  @Mutation
  public commitRemoveRuntime(runtime: Runtime): void {
    Vue.delete(this.runtimes, runtime.id);
    Vue.delete(this.statuses, runtime.id);
  }

  @Mutation
  public commitAllRuntimes(runtimes: Runtime[]): void {
    this.runtimes = runtimes.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitStatus(status: RuntimeStatus): void {
    Vue.set(this.statuses, status.id, status);
  }

  @Mutation
  public commitAllStatuses(statuses: RuntimeStatus[]): void {
    this.statuses = statuses.reduce(objReducer('id'), {});
  }

  @Action({ rawError })
  public async fetchAll(): Promise<void> {
    this.commitAll(
      await Promise.all([
        api.fetchProcesses(),
        api.fetchRuntimes(),
        api.fetchStatuses(),
      ])
    );
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
  public async startProcess(process: Process): Promise<void> {
    this.commitRuntime(await api.startProcess(process));
  }

  @Action({ rawError })
  public async fetchRuntime({ id }: { id: string }): Promise<void> {
    this.commitRuntime(await api.fetchRuntime({ id }));
  }

  @Action({ rawError })
  public async fetchStatus({ id }: { id: string }): Promise<void> {
    this.commitStatus(await api.fetchStatus({ id }));
  }

  @Action({ rawError })
  public async exitProcess(runtime: Runtime): Promise<void> {
    this.commitRemoveRuntime(await api.exitRuntime(runtime));
  }
}

export const stepperStore = getModule(StepperModule);
