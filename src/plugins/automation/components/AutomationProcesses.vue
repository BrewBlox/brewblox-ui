<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { shortDateString } from '../../../helpers/functional';
import { AutomationProcess, AutomationTemplate } from '../shared-types';
import { automationStore } from '../store';


@Component
export default class AutomationProcesses extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;


  get processes(): AutomationProcess[] {
    return automationStore.processes;
  }


  remove(proc: AutomationProcess): void {
    automationStore.removeProcess(proc);
  }

  lastResult(proc: AutomationProcess): string {
    const stepTitle = id => proc.steps.find(v => v.id === id)?.title ?? 'Unknown';
    return [...proc.results]
      .reverse()
      .slice(0, 10)
      .reverse()
      .map(res => `${shortDateString(res.date)} | ${stepTitle(res.stepId)} | ${res.stepStatus} ${res.error ?? ''}`)
      .join('\n');
  }
}
</script>

<template>
  <div class="q-pa-md">
    <div
      v-for="proc in processes"
      :key="proc.id"
      class="clickable rounded-borders depth-1 q-pa-sm"
      @click="remove(proc)"
    >
      <div>{{ proc.title }}</div>
      <div style="white-space: pre-line">
        {{ lastResult(proc) }}
      </div>
    </div>
  </div>
</template>
