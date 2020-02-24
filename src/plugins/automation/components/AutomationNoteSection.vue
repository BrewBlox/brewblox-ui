<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
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

  startChangeTitle(note: AutomationNote): void {
    createDialog({
      parent: this,
      component: 'InputDialog',
      title: 'Change note name',
      message: `Choose a new name for '${note.title}'`,
      clearable: false,
      value: note.title,
    })
      .onOk(title => this.saveNote({ ...note, title }));
  }

  editMessage(note: AutomationNote): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Message',
      title: `Edit '${note.title}'`,
      value: note.message,
    })
      .onOk(message => {
        note.message = message;
        this.saveNote(note);
      });
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
  <AutomationEditorSection
    :value="step.notes"
    label="Notes"
    @input="saveAllNotes"
    @update="saveNote"
    @title-click="item => startChangeTitle(item)"
    @new="startAddNote"
  >
    <template #description>
      Notes are displayed while the step is active.
    </template>
    <template #actions="{item}">
      <ActionItem label="Rename" icon="mdi-textbox" @click="startChangeTitle(item)" />
      <ActionItem label="Remove" icon="delete" @click="removeNote(item)" />
    </template>
    <template #item="{item}">
      <div class="column q-gutter-y-xs">
        <LabeledField
          title="Message"
          label="Message"
          :readonly="false"
          @click="editMessage(item)"
        >
          {{ item.message || 'Click to edit' }}
        </LabeledField>
      </div>
    </template>
  </AutomationEditorSection>
</template>
