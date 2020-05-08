<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { clamp, spliceById } from '@/helpers/functional';

import { nextTitle } from '../helpers';
import { conditionSpecs } from '../impl/specs';
import { AutomationCondition, AutomationStep, AutomationTemplate, AutomationTransition } from '../types';


@Component
export default class AutomationConditions extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  @Prop({ type: Object, required: true })
  public readonly transition!: AutomationTransition;

  get nextStepTitle(): string {
    return nextTitle(this.template, this.transition);
  }

  get nextStepOptions(): SelectOption[] {
    return [
      { label: '[Next step]', value: true },
      { label: '[Process end]', value: false },
      ...this.template.steps.map(step => ({ label: step.title, value: step.id })),
    ];
  }

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  save(transition: AutomationTransition = this.transition): void {
    this.$emit('update:transition', transition);
  }

  moveTransition(offset: number): void {
    const idx = this.step.transitions.findIndex(v => v.id === this.transition.id);
    const newIdx = clamp(idx + offset, 0, this.step.transitions.length - 1);
    if (idx !== -1 && idx !== newIdx) {
      const updated = [...this.step.transitions];
      updated.splice(idx, 1);
      updated.splice(newIdx, 0, this.transition);
      this.step.transitions = updated;
      this.saveStep();
    }
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
    createDialog({
      component: 'AutomationCreateDialog',
      title: 'New condition',
      specs: Object.values(conditionSpecs),
    })
      .onOk((condition: AutomationCondition) => {
        this.transition.conditions.push(condition);
        this.save();
      });
  }

  removeTransition(): void {
    this.$emit('remove:transition', this.transition);
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
            <ActionItem label="Move up" icon="mdi-chevron-up" @click="moveTransition(-1)" />
            <ActionItem label="Move down" icon="mdi-chevron-down" @click="moveTransition(1)" />
            <ActionItem label="New condition" icon="add" @click="startAddCondition" />
            <ActionItem label="Remove transition" icon="delete" @click="removeTransition" />
          </template>
        </ActionMenu>
      </div>
    </template>
    <template #empty>
      No conditions are set. <br>
      This is equivalent to all conditions evaluating true.
    </template>
  </AutomationItems>
</template>
