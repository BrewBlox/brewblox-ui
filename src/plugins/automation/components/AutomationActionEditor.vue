<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { actionComponents } from '../actions';
import { ProcessStep, StepAction } from '../types';


@Component
export default class AutomationActionEditor extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: ProcessStep;

  saveStep(step: ProcessStep = this.step): void {
    this.$emit('update:step', step);
  }

  actionComponent(action: StepAction): VueConstructor {
    return actionComponents[action.type];
  }

  saveAction(action: StepAction): void {
    spliceById(this.step.actions, action);
    this.saveStep();
  }

  saveAllActions(actions: StepAction[]): void {
    this.step.actions = actions;
    this.saveStep();
  }

  startAddAction(): void {

  }

  removeAction(action: StepAction): void {
    spliceById(this.step.actions, action, false);
    this.saveStep();
  }
}
</script>


<template>
  <AutomationSectionEditor
    :value="step.actions"
    label="Actions"
    @input="saveAllActions"
    @new="startAddAction"
  >
    <template #actions="{item}">
      <ActionItem label="Remove" icon="delete" @click="removeAction(item)" />
    </template>
    <template #item="{item}">
      <component
        :is="actionComponent(item)"
        :action="item"
        class="col"
        @update:action="saveAction"
      />
    </template>
  </AutomationSectionEditor>
</template>
