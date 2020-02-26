<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { AutomationNote, AutomationStep } from '../types';


@Component
export default class AutomationNoteSection extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: AutomationStep;

  saveStep(step: AutomationStep = this.step): void {
    this.$emit('update:step', step);
  }

  saveNote(note: AutomationNote): void {
    if (this.step) {
      spliceById(this.step.notes, note);
      this.saveStep();
    }
  }

  saveAllNotes(notes: AutomationNote[]): void {
    if (this.step) {
      this.step.notes = notes;
      this.saveStep();
    }
  }

  startAddNote(): void {

  }
}
</script>

<template>
  <AutomationEditorSection
    :value="step.notes"
    title="Notes"
    label="note"
    @input="saveAllNotes"
    @update="saveNote"
    @new="startAddNote"
  >
    <template #description>
      Notes are displayed while the step is active.
    </template>
  </AutomationEditorSection>
</template>
