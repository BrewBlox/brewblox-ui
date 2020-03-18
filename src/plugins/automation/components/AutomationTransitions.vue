<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { AutomationStep, AutomationTemplate, AutomationTransition } from '../types';


@Component
export default class AutomationTransitions extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  save(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  saveTransition(trans: AutomationTransition): void {
    spliceById(this.step.transitions, trans);
    this.save();
  }

  saveAllTransitions(transitions: AutomationTransition[]): void {
    this.step.transitions = transitions;
    this.save();
  }

  startAddTransition(): void {
    this.step.transitions.push({
      id: uid(),
      next: true,
      enabled: true,
      conditions: [],
    });
    this.save();
  }

  removeTransition(trans: AutomationTransition): void {
    spliceById(this.step.transitions, trans, false);
    this.save();
  }
}
</script>

<template>
  <div class="q-gutter-y-md q-pr-md">
    <AutomationHeader
      title="Transitions"
      subtitle="Go to another step when all conditions are satisfied."
    >
      <template #actions>
        <ActionItem label="New transition" icon="add" @click="startAddTransition" />
      </template>
    </AutomationHeader>
    <AutomationConditions
      v-for="trans in step.transitions"
      :key="trans.id"
      :template="template"
      :step="step"
      :transition="trans"
      @update:step="save"
      @update:transition="saveTransition"
      @remove:transition="removeTransition"
    />
    <div class="row justify-end q-pr-sm">
      <q-btn fab-mini color="info" icon="add" @click="startAddTransition">
        <q-tooltip>New transition</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>
