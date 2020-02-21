<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { actionComponents } from '../actions';
import { AutomationAction, AutomationStep } from '../types';


@Component
export default class AutomationActionEditor extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  actionComponent(action: AutomationAction): VueConstructor {
    return actionComponents[action.impl.type];
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
        :class="['col', {darkish: !item.enabled}]"
        @update:action="saveAction"
      />
    </template>
  </AutomationSectionEditor>
</template>
