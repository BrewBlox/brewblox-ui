<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { ProcessStep, StepNote } from '../types';


@Component
export default class AutomationNoteEditor extends Vue {

  @Prop({ type: Object, required: true })
  public readonly step!: ProcessStep;

  saveStep(step: ProcessStep = this.step): void {
    this.$emit('update:step', step);
  }

  saveNote(note: StepNote): void {
    if (this.step) {
      spliceById(this.step.notes, note);
      this.saveStep();
    }
  }

  saveAllNotes(notes: StepNote[]): void {
    if (this.step) {
      this.step.notes = notes;
      this.saveStep();
    }
  }

  startAddNote(): void {
    if (this.step) {
      this.step.notes.push({
        id: uid(),
        title: 'New note',
        message: '',
      });
      this.saveStep();
    }
  }

  removeNote(note: StepNote): void {
    if (this.step) {
      spliceById(this.step.notes, note, false);
      this.saveStep();
    }
  }
}
</script>

<template>
  <AutomationSectionEditor
    :value="step.notes"
    label="Notes"
    @input="saveAllNotes"
    @new="startAddNote"
  >
    <template #actions="{item}">
      <ActionItem label="Remove" icon="delete" @click="removeNote(item)" />
    </template>
    <template #item="{item}">
      <AutomationNote :note="item" class="col" @update:note="saveNote" />
    </template>
  </AutomationSectionEditor>
</template>
