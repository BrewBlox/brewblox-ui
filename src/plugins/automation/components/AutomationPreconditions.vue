<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { conditionSpecs } from '../impl/specs';
import { AutomationCondition, AutomationStep, AutomationTemplate } from '../types';


@Component
export default class AutomationPreconditions extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  saveCondition(condition: AutomationCondition): void {
    spliceById(this.step.preconditions, condition);
    this.saveStep();
  }

  saveAllConditions(conditions: AutomationCondition[]): void {
    this.step.preconditions = conditions;
    this.saveStep();
  }

  startAddCondition(): void {
    createDialog({
      component: 'AutomationCreateDialog',
      title: 'New condition',
      specs: Object.values(conditionSpecs),
    })
      .onOk((condition: AutomationCondition) => {
        this.step.preconditions.push(condition);
        this.saveStep();
      });
  }
}
</script>

<template>
  <AutomationItems
    label="precondition"
    :value="step.preconditions"
    @input="saveAllConditions"
    @update="saveCondition"
    @new="startAddCondition"
  >
    <template #header>
      <AutomationHeader
        title="Preconditions"
        subtitle="Go to Actions when all conditions are satisfied."
      >
        <template #actions>
          <ActionItem icon="add" label="New precondition" @click="startAddCondition" />
        </template>
      </AutomationHeader>
    </template>
    <template #empty>
      No preconditions are set. <br>
      Step actions will be applied immediately.
    </template>
  </AutomationItems>
</template>
