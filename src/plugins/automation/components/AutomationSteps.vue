<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { refElement } from '@/helpers/elements';
import { clamp, filterById, spliceById } from '@/helpers/functional';

import { nextTitle } from '../helpers';
import { allSpecs } from '../impl/specs';
import {
  AutomationImpl,
  AutomationStep,
  AutomationTemplate,
  AutomationTransition,
  Section,
} from '../types';


interface HasImpl {
  impl: AutomationImpl;
}

@Component
export default class AutomationSteps extends Vue {

  @Prop({ type: Object, required: true })
  public readonly template!: AutomationTemplate;

  @Prop({ type: String, required: false })
  public readonly stepId!: string | null;

  @Prop({ type: String, required: true })
  public readonly section!: Section;

  @Prop({ type: Number, required: true })
  public readonly scrollPrompt!: number;

  @Watch('scrollPrompt')
  promptedScroll(): void {
    refElement(this.$refs[`step--${this.stepId}`])?.scrollIntoView();
  }

  saveTemplate(template: AutomationTemplate = this.template): void {
    this.$emit('update:template', template);
  }

  saveSteps(steps: AutomationStep[] = this.template.steps): void {
    this.template.steps = steps;
    this.saveTemplate();
  }

  findOffset(evt: MouseEvent | TouchEvent | null): number {
    if (evt === null) {
      return 0;
    }
    const touch = (evt instanceof MouseEvent) ? evt : evt.touches[0];
    const el = touch.target as HTMLElement;
    const container = el.closest<HTMLElement>('.step-container');
    return container?.offsetTop ?? 0;
  }

  selectStep(stepId: string | null, section: Section, evt: MouseEvent | TouchEvent | null): void {
    this.$emit('select', stepId, section, this.findOffset(evt));
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
    this.selectStep(null, 'Preconditions', null);
  }

  pretty({ impl }: HasImpl): string {
    return allSpecs[impl.type].pretty(impl);
  }

  nextStepTitle(transition: AutomationTransition): string {
    return nextTitle(this.template, transition);
  }

  sectionClass(stepId: string, section: Section): string[] {
    return [
      'q-pa-sm rounded-borders clickable',
      stepId === this.stepId && section === this.section
        ? ''
        : 'inactive-section',
    ];
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
        :ref="`step--${step.id}`"
        :class="[
          'rounded-borders depth-2 step-container',
          step.id === stepId ? 'active-step' : 'inactive-step'
        ]"
        @click.stop="evt => step.id !== stepId && selectStep(step.id, 'Preconditions', evt)"
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
          class="q-px-md q-pb-md q-gutter-y-sm column pointer"
        >
          <!-- Preconditions -->
          <div
            :class="sectionClass(step.id, 'Preconditions')"
            @click.stop="evt => selectStep(step.id, 'Preconditions', evt)"
          >
            <div class="text-bold text-secondary">
              Preconditions
            </div>
            <div v-for="v in step.preconditions" :key="v.id">
              {{ pretty(v) }}
            </div>
          </div>
          <!-- Actions -->
          <div
            :class="sectionClass(step.id, 'Actions')"
            @click.stop="evt => selectStep(step.id, 'Actions', evt)"
          >
            <div class="text-bold text-secondary">
              Actions
            </div>
            <div v-for="v in step.actions" :key="v.id">
              {{ pretty(v) }}
            </div>
          </div>
          <!-- Transitions -->
          <div
            :class="sectionClass(step.id, 'Transitions')"
            @click.stop="evt => selectStep(step.id, 'Transitions', evt)"
          >
            <div class="text-bold text-secondary">
              Transitions
            </div>
            <div v-for="v in step.transitions" :key="v.id">
              To step: {{ nextStepTitle(v) }}
            </div>
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
.active-step
  border-left: 2px solid $secondary
  border-right: 2px solid $secondary
.inactive-step
  opacity: 0.2
.inactive-section
  opacity: 0.8
  > div
    opacity: 0.4
</style>
