<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { findById, shortDateString } from '@/helpers/functional';

import { settableStates } from './getters';
import { automationStore } from './store';
import {
  AutomationConfig,
  AutomationProcess,
  AutomationStatus,
  AutomationStepResult,
  AutomationTask,
  AutomationTemplate,
} from './types';

interface ProcessDisplay {
  proc: AutomationProcess;
  status: string;
  history: string;
  tasks: AutomationTask[];
  error: string | null;
}

@Component
export default class AutomationWidget extends WidgetBase<AutomationConfig> {
  settableStates = settableStates;

  get automationAvailable(): boolean {
    return automationStore.available;
  }

  get templates(): AutomationTemplate[] {
    return automationStore.templates;
  }

  get processes(): ProcessDisplay[] {
    return automationStore.processes
      .map(proc => {
        const recent: AutomationStepResult[] = this.processHistory(proc);
        return {
          proc,
          status: this.resultStatus(proc, recent[0]),
          history: this.historyStatus(proc, recent),
          tasks: automationStore.tasks.filter(v => v.processId === proc.id),
          error: null,
        };
      });
  }

  get tasks(): AutomationTask[] {
    return automationStore.tasks;
  }

  startEditor(): void {
    this.$router.push('/automation');
  }

  init(template: AutomationTemplate): void {
    automationStore.initProcess(template);
  }

  edit(template: AutomationTemplate): void {
    this.$router.push(`/automation/${template.id}`);
  }

  show(value: AutomationTemplate | AutomationProcess): void {
    createDialog({
      component: 'AutomationInfoDialog',
      value,
      title: `Automation process '${value.title}'`,
      message: 'A running process is not editable.',
      initialStepId: ('results' in value)
        ? value.results[value.results.length - 1]?.stepId
        : null,
    });
  }

  jump(proc: AutomationProcess): void {
    const processId = proc.id;
    createDialog({
      component: 'AutomationJumpDialog',
      processId,
    })
      .onOk(stepId => automationStore.jumpProcess({ processId, stepId }));
  }

  removeProcess(proc: AutomationProcess): void {
    automationStore.removeProcess(proc);
  }

  quickStatusIcon(task: AutomationTask): string {
    return task.status === 'Finished'
      ? 'mdi-sync'
      : 'mdi-check-all';
  }

  quickStatusValue(task: AutomationTask): AutomationStatus {
    return task.status === 'Finished'
      ? 'Active'
      : 'Finished';
  }

  changeTaskStatus(task: AutomationTask, status: AutomationStatus): void {
    if (status !== task.status) {
      automationStore.saveTask({ ...task, status });
    }
  }

  removeTask(task: AutomationTask): void {
    automationStore.removeTask(task);
  }

  processHistory(proc: AutomationProcess): AutomationStepResult[] {
    return [...proc.results]
      .reverse()
      .slice(0, 10);
  }

  resultStatus(proc: AutomationProcess, res: AutomationStepResult | undefined): string {
    if (!res) {
      return 'No results yet';
    }
    const step = proc.steps.find(v => v.id === res.stepId);
    if (!step) {
      return 'No associated step';
    }
    return `Step ${step.title} is in the ${res.phase} phase since ${shortDateString(res.date)}.`;
  }

  historyStatus(proc: AutomationProcess, results: AutomationStepResult[]): string {
    const stepTitle = id => findById(proc.steps, id)?.title ?? 'Unknown';
    return results
      .reverse()
      .map(res => `${shortDateString(res.date)} | ${stepTitle(res.stepId)} | ${res.phase} ${res.error ?? ''}`)
      .join('\n');
  }

}
</script>

<template>
  <CardWrapper v-bind="{context}" @dblclick.native="startEditor">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud">
        <template #actions>
          <ActionItem icon="settings" label="Editor" @click="startEditor" />
        </template>
      </component>
    </template>

    <div class="widget-body column">
      <CardWarning v-if="!automationAvailable">
        <template #message>
          The automation service is not available. <br>
          This feature is still in preview.
        </template>
      </CardWarning>
      <div class="col-grow text-h6 text-secondary">
        Running processes
        <q-tooltip>
          A process executes the steps in a template. <br>
          Closing the UI will not interrupt any processes.
        </q-tooltip>
      </div>
      <div
        v-for="{proc, status, history, tasks, error} in processes"
        :key="proc.id"
        class="rounded-borders depth-1 q-pl-sm q-gutter-y-xs column"
      >
        <div class="row q-mt-none">
          <div class="col-grow self-center text-bold text-blue-grey-4">
            {{ proc.title }}
          </div>
          <q-btn
            flat
            icon="mdi-information-outline"
            class="col-auto"
            @click="show(proc)"
          >
            <q-tooltip>Show process steps</q-tooltip>
          </q-btn>
          <q-btn
            flat
            icon="mdi-fast-forward"
            class="col-auto"
            @click="jump(proc)"
          >
            <q-tooltip>Jump to step</q-tooltip>
          </q-btn>
          <q-btn
            flat
            icon="clear"
            class="col-auto"
            @click="removeProcess(proc)"
          >
            <q-tooltip>Close and remove process</q-tooltip>
          </q-btn>
        </div>
        <div class="text-italic q-pr-sm">
          {{ status }}
          <q-tooltip>
            <div class="monospace darkish" style="white-space: pre-line">
              {{ history || 'No history available' }}
            </div>
          </q-tooltip>
        </div>
        <div v-if="error" class="text-negative q-pr-sm">
          {{ error }}
        </div>
        <div
          v-for="task in tasks"
          :key="task.id"
          class="row q-mr-sm q-mb-sm"
        >
          <div class="col-grow self-center q-pl-sm text-italic">
            {{ task.title }} ({{ task.ref }}) {{ task.status }}
          </div>
          <q-btn-dropdown
            split
            flat
            class="col-auto"
            :icon="quickStatusIcon(task)"
            @click="changeTaskStatus(task, quickStatusValue(task))"
          >
            <template #label>
              <q-tooltip>Mark task as {{ quickStatusValue(task) }}</q-tooltip>
            </template>
            <q-list>
              <q-item>
                <q-item-section class="fade-4 text-italic">
                  Mark task as...
                </q-item-section>
              </q-item>
              <ActionItem
                v-for="state in settableStates"
                :key="state.status"
                :label="state.status"
                :active="task.status === state.status"
                @click="changeTaskStatus(task, state.status)"
              />
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

      <div class="text-h6 text-secondary">
        Available templates
        <q-tooltip>
          Templates are the blueprints for processes. <br>
          You can use the automation editor to create or change templates.
        </q-tooltip>
      </div>
      <div
        v-for="template in templates"
        :key="template.id"
        class="rounded-borders depth-1 q-pl-sm row items-center"
      >
        <div class="col-grow">
          {{ template.title }}
        </div>
        <q-btn
          flat
          icon="mdi-settings"
          class="col-auto"
          @click="edit(template)"
        >
          <q-tooltip>Edit template</q-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="mdi-play"
          class="col-auto"
          :disable="!automationAvailable"
          @click="init(template)"
        >
          <q-tooltip>Create process</q-tooltip>
        </q-btn>
      </div>

      <div class="text-h6 text-secondary">
        All tasks
        <q-tooltip>
          Tasks are used to coordinate manual actions. <br>
          Processes can create tasks, and wait for the user to mark them as finished.
        </q-tooltip>
      </div>
      <div
        v-for="task in tasks"
        :key="task.id"
        class="rounded-borders depth-1 q-pl-sm row items-center"
      >
        <div class="col-grow">
          {{ task.title }} ({{ task.ref }}) {{ task.status }}
        </div>
        <q-btn
          flat
          class="col-auto"
          icon="delete"
          @click="removeTask(task)"
        >
          <q-tooltip>Remove task</q-tooltip>
        </q-btn>
        <q-btn
          v-if="task.status === 'Finished'"
          flat
          class="col-auto"
          icon="mdi-sync"
          @click="changeTaskStatus(task, 'Active')"
        >
          <q-tooltip>Mark task as active</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          flat
          class="col-auto"
          icon="mdi-check"
          @click="changeTaskStatus(task, 'Finished')"
        >
          <q-tooltip>Mark task as finished</q-tooltip>
        </q-btn>
      </div>
    </div>
  </CardWrapper>
</template>
