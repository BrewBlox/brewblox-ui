<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { AutomationAction, AutomationStep } from '../types';


@Component
export default class AutomationActionSection extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  saveAction(action: AutomationAction): void {
    spliceById(this.step.actions, action);
    this.saveStep();
  }

  saveAllActions(actions: AutomationAction[]): void {
    this.step.actions = actions;
    this.saveStep();
  }

  startAddAction(): void {

  }

  removeAction(action: AutomationAction): void {
    spliceById(this.step.actions, action, false);
    this.saveStep();
  }
}
</script>


<template>
  <div>
    <AutomationEditorSection
      label="action"
      :value="step.actions"
      @input="saveAllActions"
      @update="saveAction"
      @new="startAddAction"
    >
      <template #header>
        <AutomationHeader
          title="Actions"
          subtitle="Actions are executed when the step starts."
        />
      </template>
    </AutomationEditorSection>
  </div>
</template>
