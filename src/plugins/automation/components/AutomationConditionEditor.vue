<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { conditionComponents } from '../conditions';
import { ProcessStep, StepCondition } from '../types';


@Component
export default class AutomationConditionEditor extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: ProcessStep;

  saveStep(step: ProcessStep = this.step): void {
    this.$emit('update:step', step);
  }

  conditionComponent(condition: StepCondition): VueConstructor {
    return conditionComponents[condition.type];
  }

  saveCondition(condition: StepCondition): void {
    spliceById(this.step.conditions, condition);
    this.saveStep();
  }

  saveAllConditions(conditions: StepCondition[]): void {
    this.step.conditions = conditions;
    this.saveStep();
  }

  startAddCondition(): void {

  }

  removeCondition(condition: StepCondition): void {
    spliceById(this.step.conditions, condition, false);
    this.saveStep();
  }
}
</script>

<template>
  <AutomationSectionEditor
    :value="step.conditions"
    label="Conditions"
    @input="saveAllConditions"
    @new="startAddCondition"
  >
    <template #actions="{item}">
      <ActionItem label="Remove" icon="delete" @click="removeCondition(item)" />
    </template>
    <template #item="{item}">
      <component
        :is="conditionComponent(item)"
        :condition="item"
        class="col"
        @update:condition="saveCondition"
      />
    </template>
  </AutomationSectionEditor>
</template>
