<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';

import { SessionNote, SessionNotesConfig } from './types';


@Component
export default class SessionNotesFull extends CrudComponent<SessionNotesConfig> {

  get notes(): SessionNote[] {
    return this.widget.config.notes;
  }

  get typeOpts(): SelectOption[] {
    return [
      { label: 'Text', value: 'text' },
      { label: 'Date', value: 'date' },
    ];
  }

  saveTitle(note: SessionNote, title: string): void {
    if (title !== note.title) {
      note.title = title;
      this.saveConfig();
    }
  }

  saveType(note: SessionNote, type: typeof note.type): void {
    if (type !== note.type) {
      note.value = null;
      note.type = type;
      this.saveConfig();
    }
  }

  clearNote(note: SessionNote): void {
    note.value = null;
    this.saveConfig();
  }

  removeNote(note: SessionNote): void {
    const idx = this.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      this.notes.splice(idx, 1);
      this.saveConfig();
    }
  }

  addNote(): void {
    this.notes.push({
      id: uid(),
      title: 'New note',
      type: 'text',
      value: null,
    });
  }
}
</script>


<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <slot name="graph" />

    <q-card-section>
      <q-list dark>
        <q-item v-for="note in notes" :key="note.id" dark>
          <q-item-section>
            <InputField
              :value="note.title"
              title="Note title"
              label="title"
              tag="div"
              tag-class="ellipsis-3-lines"
              :tag-props="{style: 'max-width: 100%'}"
              @input="v => saveTitle(note, v)"
            />
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn-toggle outline :value="note.type" :options="typeOpts" dense @input="v => saveType(note, v)" />
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn icon="mdi-dots-vertical" flat dense>
              <q-menu>
                <q-list dark bordered>
                  <ActionItem label="Clear content" icon="clear" @click="clearNote(note)" />
                  <ActionItem label="Remove note" icon="delete" @click="removeNote(note)" />
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-space />
          <q-item-section class="col-auto">
            <q-btn outline round icon="add" @click="addNote">
              <q-tooltip>Add note</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
