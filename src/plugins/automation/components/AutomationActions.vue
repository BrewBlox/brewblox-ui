<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { actionSpecs } from '../impl/specs';
import { AutomationAction, AutomationStep, AutomationTemplate } from '../types';


@Component
export default class AutomationActions extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  save(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  saveAction(action: AutomationAction): void {
    spliceById(this.step.actions, action);
    this.save();
  }

  saveAllActions(actions: AutomationAction[]): void {
    this.step.actions = actions;
    this.save();
  }

  startAddAction(): void {
    createDialog({
      component: 'AutomationCreateDialog',
      title: 'New action',
      specs: Object.values(actionSpecs),
    })
      .onOk((action: AutomationAction) => {
        this.step.actions.push(action);
        this.save();
      });
  }

  removeAction(action: AutomationAction): void {
    spliceById(this.step.actions, action, false);
    this.save();
  }
}
</script>


<template>
  <div>
    <AutomationItems
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
        >
          <template #actions>
            <ActionItem icon="add" label="New action" @click="startAddAction" />
          </template>
        </AutomationHeader>
      </template>
    </AutomationItems>
  </div>
</template>
