<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { AutomationCondition, AutomationStep } from '../types';


@Component
export default class AutomationConditionSection extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  saveCondition(condition: AutomationCondition): void {
    spliceById(this.step.conditions, condition);
    this.saveStep();
  }

  saveAllConditions(conditions: AutomationCondition[]): void {
    this.step.conditions = conditions;
    this.saveStep();
  }

  startAddCondition(): void {

  }
}
</script>

<template>
  <AutomationEditorSection
    :value="step.conditions"
    title="Conditions"
    label="condition"
    @input="saveAllConditions"
    @update="saveCondition"
    @new="startAddCondition"
  >
    <template #description>
      The step ends when all conditions are satisfied.
    </template>
  </AutomationEditorSection>
</template>
