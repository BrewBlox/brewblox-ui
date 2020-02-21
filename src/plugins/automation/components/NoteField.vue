<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import { AutomationNote } from '../types';


@Component
export default class NoteField extends Vue {

  @Prop({ type: Object, required: true })
  public readonly note!: AutomationNote;

  saveNote(note: AutomationNote = this.note): void {
    this.$emit('update:note', note);
  }

  saveTitle(title: string): void {
    this.note.title = title;
    this.saveNote();
  }

  editTitle(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Title',
      title: `Edit '${this.note.title}'`,
      value: this.note.title,
    })
      .onOk(title => {
        this.note.title = title;
        this.saveNote();
      });
  }

  editMessage(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Message',
      title: `Edit '${this.note.title}'`,
      value: this.note.message,
    })
      .onOk(message => {
        this.note.message = message;
        this.saveNote();
      });
  }
}
</script>

<template>
  <q-list class="q-gutter-y-xs">
    <q-item class="clickable rounded-borders">
      <q-tooltip>Edit title</q-tooltip>
      <q-item-section class="text-bold" @click="editTitle">
        {{ note.title }}
      </q-item-section>
    </q-item>
    <q-item class="clickable rounded-borders">
      <q-tooltip>Edit message</q-tooltip>
      <q-item-section @click="editMessage">
        {{ note.message || 'Click to edit' }}
      </q-item-section>
    </q-item>
  </q-list>
</template>
