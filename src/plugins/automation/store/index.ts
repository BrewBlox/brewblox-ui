import { defineStore } from 'pinia';

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

interface AutomationStoreState {
  processes: AutomationProcess[];
  tasks: AutomationTask[];
  lastEvent: Date | null;
  templates: AutomationTemplate[];
  activeTemplate: string | null;
  activeStep: string | null;
}

export const useAutomationStore = defineStore('automationStore', {
  state: (): AutomationStoreState => ({
    processes: [],
    tasks: [],
    lastEvent: null,
    templates: [],
    activeTemplate: null,
    activeStep: null,
  }),
  getters: {
    available: (state): boolean => state.lastEvent != null,
    processIds: (state): string[] => state.processes.map((v) => v.id),
    taskIds: (state): string[] => state.tasks.map((v) => v.id),
    templateIds: (state): string[] => state.templates.map((v) => v.id),
  },
  actions: {
    processById(id: string | null): AutomationProcess | null {
      return findById(this.processes, id);
    },

    taskById(id: string | null): AutomationTask | null {
      return findById(this.tasks, id);
    },

    templateById(id: string | null): AutomationTemplate | null {
      return findById(this.templates, id);
    },

    setTask(task: AutomationTask): void {
      this.tasks = concatById(this.tasks, task);
    },

    setProcess(proc: AutomationProcess): void {
      this.processes = concatById(this.processes, proc);
    },

    setEventData(data: AutomationEventData): void {
      this.processes = data.processes;
      this.tasks = data.tasks;
      this.lastEvent = new Date();
    },

    invalidateEventData(): void {
      this.processes = [];
      this.tasks = [];
      this.lastEvent = null;
    },

    setActive(ids: [string | null, string | null] | null): void {
      const [templateId, stepId] = ids ?? [null, null];
      this.activeTemplate = templateId;
      this.activeStep = templateId ? stepId : null;
    },

    async createTemplate(template: AutomationTemplate): Promise<void> {
      await templateApi.create(template); // triggers callback
    },

    async saveTemplate(template: AutomationTemplate): Promise<void> {
      await templateApi.persist(template); // triggers callback
    },

    async removeTemplate(template: AutomationTemplate): Promise<void> {
      await templateApi.remove(template); // triggers callback
    },

    async initProcess(template: AutomationTemplate): Promise<void> {
      this.setProcess(await processApi.init(template));
    },

    async jumpProcess(args: AutomationStepJump): Promise<void> {
      this.setProcess(await processApi.jump(args));
    },

    async removeProcess(proc: AutomationProcess): Promise<void> {
      await processApi.remove(proc);
      this.processes = filterById(this.processes, proc);
    },

    async createTask(task: AutomationTask): Promise<void> {
      this.setTask(await taskApi.create(task));
    },

    async saveTask(task: AutomationTask): Promise<void> {
      this.setTask(await taskApi.persist(task));
    },

    async removeTask(task: AutomationTask): Promise<void> {
      await taskApi.remove(task);
      this.tasks = filterById(this.tasks, task);
    },

    async start(): Promise<void> {
      const onChange = (template: AutomationTemplate): void => {
        this.templates = concatById(this.templates, template);
      };
      const onDelete = (id: string): void => {
        this.templates = filterById(this.templates, { id });
      };

      this.templates = await templateApi.fetch();
      templateApi.subscribe(onChange, onDelete);
    },
  },
});
