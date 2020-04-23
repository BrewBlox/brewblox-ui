<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { shortDateString } from '@/helpers/functional';

import { AutomationProcess, AutomationStepResult } from './shared-types';
import { automationStore } from './store';
import { AutomationConfig, AutomationTemplate } from './types';

interface ProcessDisplay {
  proc: AutomationProcess;
  status: string;
  history: string;
  error: string | null;
}

@Component
export default class AutomationWidget extends WidgetBase<AutomationConfig> {
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
          error: null,
        };
      });
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

  removeProcess(proc: AutomationProcess): void {
    automationStore.removeProcess(proc);
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
    return `Step ${step.title} is in the ${res.stepStatus} phase since ${shortDateString(res.date)}.`;
  }

  historyStatus(proc: AutomationProcess, results: AutomationStepResult[]): string {
    const stepTitle = id => proc.steps.find(v => v.id === id)?.title ?? 'Unknown';
    return results
      .reverse()
      .map(res => `${shortDateString(res.date)} | ${stepTitle(res.stepId)} | ${res.stepStatus} ${res.error ?? ''}`)
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
      <div class="text-h6 text-secondary">
        Running processes
      </div>
      <div
        v-for="{proc, status, history, error} in processes"
        :key="proc.id"
        class="rounded-borders depth-1 q-pl-sm q-gutter-y-xs column"
      >
        <div class="row q-mt-none">
          <div class="col-grow self-center text-bold text-blue-grey-4">
            {{ proc.title }}
          </div>
          <q-btn
            flat
            icon="clear"
            class="col-auto"
            @click="removeProcess(proc)"
          >
            <q-tooltip>Exit process</q-tooltip>
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
      </div>

      <div class="text-h6 text-secondary">
        Available templates
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
          @click="init(template)"
        >
          <q-tooltip>Start process from template</q-tooltip>
        </q-btn>
      </div>
    </div>
  </CardWrapper>
</template>
