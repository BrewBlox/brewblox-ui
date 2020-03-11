import Vue from 'vue';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { objReducer } from '@/helpers/functional';
import store from '@/store';

import { AutomationEventData, AutomationProcess, AutomationTask, AutomationTemplate } from '../types';
import { templateApi } from './api';

const rawError = true;

@Module({ store, namespaced: true, dynamic: true, name: 'automation' })
export class AutomationModule extends VuexModule {
  public processes: Mapped<AutomationProcess> = {};
  public tasks: Mapped<AutomationTask> = {};
  public lastEvent: Date | null = null;

  public templates: Mapped<AutomationTemplate> = {};
  public activeTemplate: string | null = null;
  public activeStep: string | null = null;

  public get processIds(): string[] {
    return Object.keys(this.processes);
  }

  public get processValues(): AutomationProcess[] {
    return Object.values(this.processes);
  }

  public get processById(): (id: string) => AutomationProcess {
    return id => this.processes[id] ?? null;
  }

  public get taskIds(): string[] {
    return Object.keys(this.tasks);
  }

  public get taskValues(): AutomationTask[] {
    return Object.values(this.tasks);
  }

  public get taskById(): (id: string) => AutomationTask {
    return id => this.tasks[id] ?? null;
  }

  public get templateIds(): string[] {
    return Object.keys(this.templates);
  }

  public get templateValues(): AutomationTemplate[] {
    return Object.values(this.templates);
  }

  public get templateById(): (id: string) => AutomationTemplate {
    return id => this.templates[id] ?? null;
  }

  @Mutation
  public commitEventData(data: AutomationEventData): void {
    this.processes = data.processes.reduce(objReducer('id'), {});
    this.tasks = data.tasks.reduce(objReducer('id'), {});
    this.lastEvent = new Date();
  }

  @Mutation
  public invalidateEventData(): void {
    this.processes = {};
    this.tasks = {};
    this.lastEvent = null;
  }

  @Mutation
  public commitTemplate(template: AutomationTemplate): void {
    Vue.set(this.templates, template.id, template);
  }

  @Mutation
  public commitRemoveTemplate(template: AutomationTemplate): void {
    Vue.delete(this.templates, template.id);
  }

  @Mutation
  public commitAllTemplates(processes: AutomationTemplate[]): void {
    this.templates = processes.reduce(objReducer('id'), {});
  }

  @Mutation
  public commitActive(ids: [string, string | null] | null): void {
    if (ids) {
      this.activeTemplate = ids[0];
      this.activeStep = ids[1];
    }
    else {
      this.activeTemplate = null;
      this.activeStep = null;
    }
  }

  @Action({ rawError })
  public async fetchTemplates(): Promise<void> {
    this.commitAllTemplates(await templateApi.fetch());
  }

  @Action({ rawError })
  public async createTemplate(template: AutomationTemplate): Promise<void> {
    this.commitTemplate(await templateApi.create(template));
  }

  @Action({ rawError })
  public async saveTemplate(template: AutomationTemplate): Promise<void> {
    this.commitTemplate(await templateApi.persist(template));
  }

  @Action({ rawError })
  public async removeTemplate(template: AutomationTemplate): Promise<void> {
    await templateApi.remove(template);
    this.commitRemoveTemplate(template);
  }

  @Action({ rawError })
  public async start(): Promise<void> {
    const onChange = (template: AutomationTemplate): void => {
      const existing = this.templateById(template.id);
      if (!existing || existing._rev !== template._rev) {
        this.commitTemplate(template);
      }
    };
    const onDelete = (id: string): void => {
      const existing = this.templateById(id);
      if (existing) {
        this.commitRemoveTemplate(existing);
      }
    };

    this.commitAllTemplates(await templateApi.fetch());
    templateApi.subscribe(onChange, onDelete);
  }
}

export const automationStore = getModule(AutomationModule);
