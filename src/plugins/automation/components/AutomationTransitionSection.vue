<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { AutomationCondition, AutomationStep, AutomationTemplate, AutomationTransition } from '../types';


@Component
export default class AutomationTransitionSection extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  save(trans: AutomationTransition): void {
    spliceById(this.step.transitions, trans);
    this.saveStep();
  }

  saveAll(transitions: AutomationTransition[]): void {
    this.step.transitions = transitions;
    this.saveStep();
  }

  remove(trans: AutomationTransition): void {
    spliceById(this.step.transitions, trans, false);
    this.saveStep();
  }

  saveCondition(transition: AutomationTransition, condition: AutomationCondition): void {
    spliceById(transition.conditions, condition);
    this.save(transition);
  }

  saveAllConditions(transition: AutomationTransition, conditions: AutomationCondition[]): void {
    transition.conditions = conditions;
    this.save(transition);
  }

  startAddCondition(transition: AutomationTransition): void {

  }

  nextStepTitle(trans: AutomationTransition): string {
    return this.template.steps.find(s => s.id === trans.stepId)?.title ?? 'next step';
  }

  editNextStep(trans: AutomationTransition): void {

  }
}
</script>

<template>
  <div class="q-gutter-y-sm q-pr-md">
    <AutomationHeader
      title="Transitions"
      subtitle="Go to another step when all conditions are satisfied."
    />
    <AutomationConditionSection
      v-for="trans in step.transitions"
      :key="trans.id"
      :template="template"
      :transition="trans"
      @update:transition="save"
    >
      <template #actions>
        <ActionItem label="Priority up" />
        <ActionItem label="Priority down" />
        <ActionItem label="Rename" />
        <ActionItem label="Remove up" />
      </template>
    </AutomationConditionSection>
  </div>
</template>
