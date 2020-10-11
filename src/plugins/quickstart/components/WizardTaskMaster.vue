<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import WizardBase from '@/plugins/wizardry/WizardBase';

import { WizardAction } from './QuickStartTaskBase';

@Component
export default class WizardTaskMaster extends WizardBase {
  config: any = {};
  actions: WizardAction[] = [];
  taskHistory: string[] = [];
  tasks: string[] = [];

  currentTask: string | null = null;

  @Prop({ type: Array, required: true })
  readonly initialTasks!: string[];

  @Prop({ type: Object, default: () => ({}) })
  readonly initialConfig!: any;

  previousTask(): void {
    if (this.taskHistory.length > 0) {
      if (this.currentTask !== null) {
        this.tasks.push(this.currentTask);
      }
      this.currentTask = this.taskHistory.pop() || null;
    } else {
      this.back();
    }
  }

  nextTask(): void {
    if (this.tasks.length === 0) {
      return;
    }
    if (this.currentTask) {
      this.taskHistory.push(this.currentTask);
    }
    this.currentTask = this.tasks.pop() || null;
  }

  created(): void {
    this.tasks = [...this.initialTasks].reverse();
    this.config = { ...this.initialConfig };
    this.nextTask();
  }
}
</script>

<template>
  <div class="full-height">
    <component
      :is="currentTask"
      v-if="currentTask"
      :config.sync="config"
      :actions.sync="actions"
      :tasks.sync="tasks"
      @back="previousTask"
      @next="nextTask"
      @finish="close"
      @cancel="close"
    />
  </div>
</template>
