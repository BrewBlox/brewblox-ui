<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { AutomationCondition, AutomationTemplate, AutomationTransition } from '../types';


@Component
export default class AutomationConditionSection extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: Object, required: true })
  public readonly transition!: AutomationTransition;

  get nextStepTitle(): string {
    const { stepId } = this.transition;
    return this.template.steps.find(s => s.id === stepId)?.title ?? 'next step';
  }

  get nextStepOptions(): SelectOption[] {
    return [
      { label: '[Next step]', value: null },
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
      value: this.transition.stepId,
      selectOptions: this.nextStepOptions,
      selectProps: {
        label: 'Step',
        emitValue: true,
        mapOptions: true,
        clearable: true,
      },
    })
      .onOk(id => {
        this.transition.stepId = id;
        this.save();
      });
  }
}
</script>

<template>
  <AutomationEditorSection
    label="condition"
    :value="transition.conditions"
    class="depth-1 rounded-borders"
    @input="saveAllConditions"
    @update="saveCondition"
    @new="startAddCondition"
  >
    <template #header>
      <div class="row items-center ">
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
        <ActionMenu round class="col-auto">
          <template #actions>
            <slot name="actions" />
          </template>
        </ActionMenu>
      </div>
    </template>
  </AutomationEditorSection>
</template>
