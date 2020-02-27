<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { AutomationCondition, AutomationTemplate, AutomationTransition } from '../types';


@Component
export default class AutomationConditions extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: Object, required: true })
  public readonly transition!: AutomationTransition;

  get nextStepTitle(): string {
    const { next } = this.transition;
    if (next === true) { return 'next step'; }
    if (next === false) { return 'process end'; }
    return this.template.steps.find(s => s.id === next)?.title ?? 'unknown step';
  }

  get nextStepOptions(): SelectOption[] {
    return [
      { label: '[Next step]', value: true },
      { label: '[Process end]', value: false },
      ...this.template.steps.map(step => ({ label: step.title, value: step.id })),
    ];
  }

  save(transition: AutomationTransition = this.transition): void {
    this.$emit('update:transition', transition);
  }

  saveCondition(condition: AutomationCondition): void {
    spliceById(this.transition.conditions, condition);
    this.save();
  }

  saveAllConditions(conditions: AutomationCondition[]): void {
    this.transition.conditions = conditions;
    this.save();
  }

  startAddCondition(): void {

  }

  editNextStep(): void {
    createDialog({
      component: 'SelectDialog',
      title: 'Select next step',
      message: 'Pick the step that will be started if all conditions in this transition are satisfied.',
      value: this.transition.next,
      selectOptions: this.nextStepOptions,
      selectProps: {
        label: 'Step',
        emitValue: true,
        mapOptions: true,
      },
    })
      .onOk(value => {
        this.transition.next = value;
        this.save();
      });
  }
}
</script>

<template>
  <AutomationItems
    label="condition"
    :value="transition.conditions"
    class="depth-1 rounded-borders"
    :style="{opacity: transition.enabled ? 1 : 0.3}"
    @input="saveAllConditions"
    @update="saveCondition"
    @new="startAddCondition"
  >
    <template #header>
      <div class="row items-center q-py-xs">
        <div class="text-h5 col-grow">
          Go to
          <span
            class="text-secondary pointer"
            @click="editNextStep"
          >
            {{ nextStepTitle }}
          </span>
          if...
        </div>
        <EnabledButton
          :value="transition.enabled"
          round
          dense
          class="col-auto"
          @input="v => {transition.enabled = v; save();}"
        />
        <ActionMenu round dense class="col-auto">
          <template #actions>
            <slot name="actions" />
          </template>
        </ActionMenu>
      </div>
    </template>
  </AutomationItems>
</template>
