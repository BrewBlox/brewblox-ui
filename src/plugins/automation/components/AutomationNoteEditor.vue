<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { spliceById } from '@/helpers/functional';

import { AutomationNote, AutomationStep } from '../types';


@Component
export default class AutomationNoteEditor extends Vue {

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
    if (this.step) {
      this.step.notes.push({
        id: uid(),
        title: 'New note',
        message: '',
      });
      this.saveStep();
    }
  }

  removeNote(note: AutomationNote): void {
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
      <NoteField :note="item" class="col" @update:note="saveNote" />
    </template>
  </AutomationSectionEditor>
</template>
