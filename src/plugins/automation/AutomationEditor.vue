<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { clamp, spliceById } from '@/helpers/functional';

import { automationStore } from './store';
import { AutomationStep, AutomationTemplate, Section } from './types';


@Component
export default class AutomationEditor extends DialogBase {
  offset: number = 0;
  scrollPrompt: number = 0;

  dragged: AutomationStep | null = null;
  section: Section = 'Preconditions';

  @Prop({ type: String, required: true })
  public readonly templateId!: string;

  @Prop({ type: String })
  public readonly stepId!: string | null;

  selectActive(templateId: string | null, stepId: string | null = null): void {
    this.$emit('update:active', templateId, stepId);
  }

  get automationAvailable(): boolean {
    return automationStore.available;
  }

  get template(): AutomationTemplate | null {
    return automationStore.templateById(this.templateId);
  }

  get steps(): AutomationStep[] {
    return this.template?.steps ?? [];
  }

  get step(): AutomationStep | null {
    return this.template?.steps.find(s => s.id === this.stepId) ?? null;
  }

  saveTemplate(template: AutomationTemplate | null = this.template): void {
    if (template) {
      automationStore.saveTemplate(template);
    }
  }

  saveSteps(steps: AutomationStep[]): void {
    if (this.template !== null) {
      this.template.steps = steps;
      this.saveTemplate();
    }
  }

  saveStep(step: AutomationStep | null = this.step): void {
    if (this.template !== null && step !== null) {
      spliceById(this.template.steps, step);
      this.saveTemplate();
    }
  }

  moveStep(step: AutomationStep, offset: number): void {
    const idx = this.steps.findIndex(v => v.id === step.id);
    const newIdx = clamp(idx + offset, 0, this.steps.length - 1);
    if (idx !== -1 && idx !== newIdx) {
      const updated = [...this.steps];
      updated.splice(idx, 1);
      updated.splice(newIdx, 0, step);
      this.saveSteps(updated);
    }
  }

  scrollToStep(): void {
    this.scrollPrompt += 1;
  }
}
</script>

<template>
  <q-page>
    <div
      v-if="step"
      class="page-height column no-wrap q-pa-md q-gutter-md"
    >
      <CardWarning v-if="!automationAvailable">
        <template #message>
          The automation service is not available. <br>
          This feature is still in preview.
        </template>
      </CardWarning>
      <q-tabs v-model="section">
        <q-btn
          flat
          color="secondary"
          class="q-mr-xl self-stretch"
          :label="step.title"
          @click="scrollToStep"
        />
        <q-tab name="Preconditions" label="Preconditions" />
        <q-tab name="Actions" label="Actions" />
        <q-tab name="Transitions" label="Transitions" />
      </q-tabs>
      <q-scroll-area visible class="col">
        <div class="row section-parent q-pl-lg justify-center">
          <AutomationSteps
            :template="template"
            :step-id="stepId"
            :section="section"
            :scroll-prompt="scrollPrompt"
            @update:template="saveTemplate"
            @select="(v, s, o) => { selectActive(templateId, v); section = s; offset = o; }"
          />
          <AutomationPreconditions
            v-if="section === 'Preconditions'"
            :template="template"
            :step="step"
            :style="`margin-top: ${offset}px`"
            @update:step="saveStep"
          />
          <AutomationActions
            v-if="section === 'Actions'"
            :template="template"
            :step="step"
            :style="`margin-top: ${offset}px`"
            @update:step="saveStep"
          />
          <AutomationTransitions
            v-if="section === 'Transitions'"
            :template="template"
            :step="step"
            :style="`margin-top: ${offset}px`"
            @update:step="saveStep"
          />
        </div>
      </q-scroll-area>
    </div>
  </q-page>
</template>

<style lang="sass" scoped>
.section-parent > div
  width: 600px
  max-width: 600px
</style>
