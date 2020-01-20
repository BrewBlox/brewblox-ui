<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import { StepNote } from '../types';


@Component
export default class AutomationNote extends Vue {

  @Prop({ type: Object, required: true })
  public readonly note!: StepNote;

  saveNote(note: StepNote = this.note): void {
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
  <q-list>
    <q-item class="hoverable">
      <q-tooltip>Edit title</q-tooltip>
      <q-item-section class="text-bold" @click="editTitle">
        {{ note.title }}
      </q-item-section>
    </q-item>
    <q-item class="hoverable">
      <q-tooltip>Edit message</q-tooltip>
      <q-item-section @click="editMessage">
        {{ note.message || 'Click to edit' }}
      </q-item-section>
    </q-item>
  </q-list>
</template>
