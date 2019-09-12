<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { WizardAction } from '@/components/Wizard/WizardTaskBase';

@Component
export default class WizardTaskMaster extends Vue {
  config: any = {};
  actions: WizardAction[] = [];
  taskHistory: string[] = [];
  tasks: string[] = [];

  currentTask: string | null = null;

  @Prop({ type: Array, required: true })
  readonly initialTasks!: string[];

  @Prop({ type: Object, default: () => ({}) })
  readonly initialConfig!: any;

  @Emit()
  public back(): void { }

  @Emit()
  public close(): void { }

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
    this.tasks = [...this.initialTasks];
    this.config = { ...this.initialConfig };
    this.nextTask();
  }
}
</script>

<template>
  <div>
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
