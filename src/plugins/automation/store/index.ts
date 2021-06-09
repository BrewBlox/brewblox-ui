import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import store from '@/store';
import { concatById, filterById, findById } from '@/utils/collections';

import type {
  AutomationEventData,
  AutomationProcess,
  AutomationStepJump,
  AutomationTask,
  AutomationTemplate,
} from '../types';
import * as processApi from './process-api';
import * as taskApi from './task-api';
import templateApi from './template-api';

@Module({ generateMutationSetters: true })
export class AutomationModule extends VuexModule {
  public processes: AutomationProcess[] = [];
  public tasks: AutomationTask[] = [];
  public lastEvent: Date | null = null;

  public templates: AutomationTemplate[] = [];
  public activeTemplate: string | null = null;
  public activeStep: string | null = null;

  public get available(): boolean {
    return this.lastEvent !== null;
  }

  public get processIds(): string[] {
    return this.processes.map(v => v.id);
  }

  public get taskIds(): string[] {
    return this.tasks.map(v => v.id);
  }

  public get templateIds(): string[] {
    return this.templates.map(v => v.id);
  }

  public processById(id: string | null): AutomationProcess | null {
    return findById(this.processes, id);
  }

  public taskById(id: string | null): AutomationTask | null {
    return findById(this.tasks, id);
  }

  public templateById(id: string | null): AutomationTemplate | null {
    return findById(this.templates, id);
  }

  @Mutation
  public setTask(task: AutomationTask): void {
    this.tasks = concatById(this.tasks, task);
  }

  @Mutation
  public setProcess(proc: AutomationProcess): void {
    this.processes = concatById(this.processes, proc);
  }

  @Mutation
  public setEventData(data: AutomationEventData): void {
    this.processes = data.processes;
    this.tasks = data.tasks;
    this.lastEvent = new Date();
  }

  @Mutation
  public invalidateEventData(): void {
    this.processes = [];
    this.tasks = [];
    this.lastEvent = null;
  }

  @Mutation
  public setActive(ids: [string | null, string | null] | null): void {
    const [templateId, stepId] = ids ?? [null, null];
    this.activeTemplate = templateId;
    this.activeStep = templateId ? stepId : null;
  }

  @Action
  public async createTemplate(template: AutomationTemplate): Promise<void> {
    await templateApi.create(template); // triggers callback
  }

  @Action
  public async saveTemplate(template: AutomationTemplate): Promise<void> {
    await templateApi.persist(template); // triggers callback
  }

  @Action
  public async removeTemplate(template: AutomationTemplate): Promise<void> {
    await templateApi.remove(template); // triggers callback
  }

  @Action
  public async initProcess(template: AutomationTemplate): Promise<void> {
    this.setProcess(await processApi.init(template));
  }

  @Action
  public async jumpProcess(args: AutomationStepJump): Promise<void> {
    this.setProcess(await processApi.jump(args));
  }

  @Action
  public async removeProcess(proc: AutomationProcess): Promise<void> {
    await processApi.remove(proc);
    this.processes = filterById(this.processes, proc);
  }

  @Action
  public async createTask(task: AutomationTask): Promise<void> {
    this.setTask(await taskApi.create(task));
  }

  @Action
  public async saveTask(task: AutomationTask): Promise<void> {
    this.setTask(await taskApi.persist(task));
  }

  @Action
  public async removeTask(task: AutomationTask): Promise<void> {
    await taskApi.remove(task);
    this.tasks = filterById(this.tasks, task);
  }

  @Action
  public async start(): Promise<void> {
    const onChange = (template: AutomationTemplate): void => {
      this.templates = concatById(this.templates, template);
    };
    const onDelete = (id: string): void => {
      this.templates = filterById(this.templates, { id });
    };

    this.templates = await templateApi.fetch();
    templateApi.subscribe(onChange, onDelete);
  }
}

export const automationStore = new AutomationModule({ store, name: 'automation' });
