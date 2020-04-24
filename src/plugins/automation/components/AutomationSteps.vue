<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { clamp, filterById, spliceById } from '@/helpers/functional';

import { AutomationStep, AutomationTemplate } from '../shared-types';


@Component
export default class AutomationSteps extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: String, required: false })
  public readonly stepId!: string | null;

  saveTemplate(template: AutomationTemplate = this.template): void {
    this.$emit('update:template', template);
  }

  saveSteps(steps: AutomationStep[] = this.template.steps): void {
    this.template.steps = steps;
    this.saveTemplate();
  }

  selectStep(stepId: string | null, section: string): void {
    this.$emit('select', stepId, section);
  }

  get locals(): AutomationStep[] {
    return this.template.steps;
  }

  set locals(steps: AutomationStep[]) {
    this.saveSteps(steps);
  }

  addStep(): void {
    const step: AutomationStep = {
      id: uid(),
      title: 'New step',
      preconditions: [],
      actions: [],
      transitions: [],
    };
    this.locals.push(step);
    this.saveTemplate();
  }

  move(step: AutomationStep, offset: number): void {
    const idx = this.locals.findIndex(v => v.id === step.id);
    const newIdx = clamp(idx + offset, 0, this.locals.length - 1);
    if (idx !== -1 && idx !== newIdx) {
      const updated = [...this.locals];
      updated.splice(idx, 1);
      updated.splice(newIdx, 0, step);
      this.locals = updated;
    }
  }

  startChangeTitle(step: AutomationStep): void {
    createDialog({
      parent: this,
      component: 'InputDialog',
      title: 'Change step name',
      message: `Choose a new name for '${step.title}'`,
      clearable: false,
      value: step.title,
    })
      .onOk(title => this.locals = spliceById(this.locals, { ...step, title }));
  }

  removeStep(step: AutomationStep): void {
    this.locals = filterById(this.locals, step);
    this.selectStep(null, 'Steps');
  }
}
</script>

<template>
  <div class="q-px-md q-pb-md">
    <AutomationHeader
      title="Steps"
      subtitle="Wait for preconditions, apply actions, and transition to another step."
    >
      <template #actions>
        <ActionItem icon="add" label="New step" @click="addStep" />
      </template>
    </AutomationHeader>
    <draggable
      v-model="locals"
      class="column q-gutter-y-md q-my-none"
    >
      <div
        v-for="step in locals"
        :key="step.id"
        :class="['rounded-borders depth-2', step.id === stepId && 'selected-step']"
      >
        <div class="toolbar__Dashboard">
          <Toolbar
            :title="step.title"
            @title-click="startChangeTitle(step)"
          >
            <template #buttons>
              <ActionMenu dense round>
                <template #actions>
                  <ActionItem label="Move up" icon="mdi-chevron-up" @click="move(step, -1)" />
                  <ActionItem label="Move down" icon="mdi-chevron-down" @click="move(step, 1)" />
                  <ActionItem label="Rename step" icon="edit" @click="startChangeTitle(step)" />
                  <ActionItem label="Remove step" icon="delete" @click="removeStep(step)" />
                </template>
              </ActionMenu>
            </template>
          </Toolbar>
        </div>
        <div
          class="q-px-md q-pb-md q-gutter-x-sm row text-secondary pointer"
          @click.stop="selectStep(step.id, 'Steps')"
        >
          <div
            class="q-pa-sm rounded-borders clickable"
            @click.stop="selectStep(step.id, 'Preconditions')"
          >
            {{ step.preconditions.length }} preconditions
          </div>
          <div
            class="q-pa-sm rounded-borders clickable"
            @click.stop="selectStep(step.id, 'Actions')"
          >
            {{ step.actions.length }} actions
          </div>
          <div
            class="q-pa-sm rounded-borders clickable"
            @click.stop="selectStep(step.id, 'Transitions')"
          >
            {{ step.transitions.length }} transitions
          </div>
        </div>
      </div>
    </draggable>
    <div class="row justify-end q-pt-md q-pr-sm">
      <q-btn fab-mini color="secondary" icon="add" @click="addStep">
        <q-tooltip>New step</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.selected-step
  border-left: 2px solid $secondary
  border-right: 2px solid $secondary
</style>
