import { Action, Module, Mutation, VuexModule } from 'vuex-class-modules';

import { extendById, filterById } from '@/helpers/functional';
import store from '@/store';

import { AutomationEventData, AutomationProcess, AutomationTask, AutomationTemplate } from '../types';
import { templateApi } from './api';

@Module({ generateMutationSetters: true })
export class AutomationModule extends VuexModule {
  public processes: AutomationProcess[] = [];
  public tasks: AutomationTask[] = [];
  public lastEvent: Date | null = null;

  public templates: AutomationTemplate[] = [];
  public activeTemplate: string | null = null;
  public activeStep: string | null = null;

  public get processIds(): string[] {
    return this.processes.map(v => v.id);
  }

  public get taskIds(): string[] {
    return this.tasks.map(v => v.id);
  }

  public get templateIds(): string[] {
    return this.templates.map(v => v.id);
  }

  public processById(id: string): AutomationProcess | null {
    return this.processes.find(v => v.id === id) ?? null;
  }

  public taskById(id: string): AutomationTask | null {
    return this.tasks.find(v => v.id === id) ?? null;
  }

  public templateById(id: string): AutomationTemplate | null {
    return this.templates.find(v => v.id === id) ?? null;
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
  public setActive(ids: [string, string | null] | null): void {
    if (ids) {
      this.activeTemplate = ids[0];
      this.activeStep = ids[1];
    }
    else {
      this.activeTemplate = null;
      this.activeStep = null;
    }
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
  public async start(): Promise<void> {
    const onChange = (template: AutomationTemplate): void => {
      const existing = this.templateById(template.id);
      if (!existing || existing._rev !== template._rev) {
        this.templates = extendById(this.templates, template);
      }
    };
    const onDelete = (id: string): void => {
      this.templates = filterById(this.templates, { id });
    };

    this.templates = await templateApi.fetch();
    templateApi.subscribe(onChange, onDelete);
  }
}

export const automationStore = new AutomationModule({ store, name: 'automation' });
