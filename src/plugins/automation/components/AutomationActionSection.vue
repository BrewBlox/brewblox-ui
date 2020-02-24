<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { actionComponents } from '../actions';
import { AutomationAction, AutomationStep } from '../types';


@Component
export default class AutomationActionSection extends Vue {

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

  startChangeTitle(action: AutomationAction): void {
    createDialog({
      parent: this,
      component: 'InputDialog',
      title: 'Change action name',
      message: `Choose a new name for '${action.title}'`,
      clearable: false,
      value: action.title,
    })
      .onOk(title => this.saveAction({ ...action, title }));
  }

  toggleIcon(action: AutomationAction): string {
    return action.enabled
      ? 'mdi-checkbox-marked-outline'
      : 'mdi-checkbox-blank-outline';
  }

  toggleEnabled(action: AutomationAction): void {
    action.enabled = !action.enabled;
    this.saveAction(action);
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
  <AutomationEditorSection
    :value="step.actions"
    label="Actions"
    @input="saveAllActions"
    @update="saveAction"
    @title-click="item => startChangeTitle(item)"
    @new="startAddAction"
  >
    <template #description>
      Actions are executed when the step starts.
    </template>
    <template #actions="{item}">
      <ActionItem label="Rename" icon="mdi-textbox" @click="startChangeTitle(item)" />
      <ActionItem label="Remove" icon="delete" @click="removeAction(item)" />
    </template>
    <template #item="{item}">
      <component
        :is="actionComponent(item)"
        :action="item"
        :style="{opacity: item.enabled ? 1 : 0.5}"
        @update:action="saveAction"
      />
    </template>
  </AutomationEditorSection>
</template>
