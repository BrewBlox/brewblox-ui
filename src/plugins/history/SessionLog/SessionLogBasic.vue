<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { shortDateString } from '@/helpers/functional';

import SessionGraphNoteDialog from './SessionGraphNoteDialog.vue';
import SessionTextNoteDialog from './SessionTextNoteDialog.vue';
import { Session, SessionGraphNote, SessionLogConfig, SessionNote } from './types';


@Component({
  components: {
    SessionTextNoteDialog,
    SessionGraphNoteDialog,
  },
})
export default class SessionLogBasic extends CrudComponent<SessionLogConfig> {
  shortDateString = shortDateString;

  get session(): Session | null {
    return this.widget.config.sessions.find(s => s.id === this.widget.config.currentSession) || null;
  }

  get notes(): SessionNote[] {
    return this.session ? this.session.notes : [];
  }

  saveNote(note: SessionNote): void {
    const idx = this.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      this.notes[idx] = note;
      this.saveConfig(this.widget.config);
    }
  }

  openNote(note: SessionNote): void {
    if (note.type === 'Text') {
      createDialog({
        component: SessionTextNoteDialog,
        title: note.title,
        parent: this,
        value: note.value,
        type: 'text',
        label: 'Content',
      })
        .onOk(value => this.saveNote({ ...note, value }));
    }

    if (note.type === 'Graph') {
      createDialog({
        component: 'GraphDialog',
        parent: this,
        graphId: note.id,
        config: {
          ...note.config,
          params: {
            start: note.start || undefined,
            end: note.end || undefined,
            duration: note.start ? undefined : '1h',
          },
        },
      });
    }
  }

  startGraphNote(note: SessionGraphNote): void {
    note.start = new Date().getTime();
    this.saveConfig();
  }

  stopGraphNote(note: SessionGraphNote): void {
    note.end = new Date().getTime();
    this.saveConfig();
  }

  editGraphNote(note: SessionGraphNote): void {
    createDialog({
      component: SessionGraphNoteDialog,
      title: note.title,
      parent: this,
      value: note,
      label: 'Dates',
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
      <q-item v-if="!!session" dark dense>
        <q-item-section class="col-auto text-grey-2">
          <span class="text-italic">{{ session.title }}</span>
          <span>{{ new Date(session.date).toLocaleString() }}</span>
        </q-item-section>
      </q-item>
      <div class="row">
        <q-item
          v-for="note in notes"
          :key="note.id"
          dark
          clickable
          :class="[`col-${note.col}`, 'align-children']"
          @click="openNote(note)"
        >
          <!-- Text note -->
          <template v-if="note.type === 'Text'">
            <q-item-section>
              <q-item-label caption class="text-info">
                {{ note.title }}
              </q-item-label>
              <!-- No line breaks to allow correctly rendering whitespace -->
              <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
              <div v-if="!!note.value" class="note-text">{{ note.value }}</div>
              <div v-else class="text-grey text-italic">
                Click to set
              </div>
            </q-item-section>
          </template>
          <!-- Graph note -->
          <template v-if="note.type === 'Graph'">
            <q-item-section>
              <q-item-label caption class="text-info">
                {{ note.title }}
              </q-item-label>
              <span>Start {{ shortDateString(note.start, '---') }}</span>
              <span>End {{ shortDateString(note.end, '---') }}</span>
            </q-item-section>
            <q-btn v-if="note.start === null" flat stretch label="Start" @click.stop="startGraphNote(note)" />
            <q-btn v-else-if="note.end === null" flat stretch label="Stop" @click.stop="stopGraphNote(note)" />
            <q-btn v-else flat stretch label="Edit" @click.stop="editGraphNote(note)" />
          </template>
        </q-item>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.note-text {
  white-space: pre-wrap;
}
</style>
