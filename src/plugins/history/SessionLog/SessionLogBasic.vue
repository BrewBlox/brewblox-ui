<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { shortDateString, spliceById } from '@/helpers/functional';

import { historyStore } from '../store';
import { GraphAnnotation, LoggedSession, SessionGraphNote, SessionNote } from '../types';
import SessionGraphNoteDialog from './SessionGraphNoteDialog.vue';
import SessionHeaderField from './SessionHeaderField.vue';
import SessionTextNoteDialog from './SessionTextNoteDialog.vue';
import { SessionLogConfig } from './types';


@Component({
  components: {
    SessionTextNoteDialog,
    SessionGraphNoteDialog,
    SessionHeaderField,
  },
})
export default class SessionLogBasic extends CrudComponent<SessionLogConfig> {
  shortDateString = shortDateString;

  get session(): LoggedSession | null {
    return this.config.currentSession === null
      ? null
      : historyStore.sessionById(this.config.currentSession);
  }

  saveSession(session: LoggedSession | null = this.session): void {
    if (session !== null) {
      historyStore.saveSession(session);
    }
  }

  get notes(): SessionNote[] {
    return this.session ? this.session.notes : [];
  }

  saveNote(note: SessionNote): void {
    spliceById(this.notes, note);
    this.saveSession();
  }

  saveAnnotations(note: SessionGraphNote, annotations: GraphAnnotation[]): void {
    note.config.layout.annotations = annotations;
    this.saveNote(note);
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
        saveAnnotations: v => this.saveAnnotations(note, v),
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
    this.saveSession();
  }

  stopGraphNote(note: SessionGraphNote): void {
    note.end = new Date().getTime();
    this.saveSession();
  }

  editGraphNote(note: SessionGraphNote): void {
    createDialog({
      component: SessionGraphNoteDialog,
      title: note.title,
      message: 'You can choose graph lines in the widget settings.',
      parent: this,
      value: note,
      label: 'Dates',
    })
      .onOk(({ start, end }) => {
        const actual = this.notes.find(n => n.id === note.id);
        if (actual && actual.type === 'Graph') {
          actual.start = start;
          actual.end = end;
          this.saveSession();
        }
      });
  }

  addSession(): void {
    this.$emit('add');
  }
}
</script>


<template>
  <div class="widget-lg">
    <slot name="warnings" />

    <div v-if="session !== null" class="row q-ma-md">
      <SessionHeaderField
        :session="session"
        class="col q-mb-sm"
        @update:session="saveSession"
      />

      <div class="col-break" />

      <div
        v-for="note in notes"
        :key="note.id"
        :class="[`col-${note.col}`, 'q-pa-xs']"
      >
        <div
          class="row q-pa-sm q-gutter-x-xs clickable rounded-borders"
          @click="openNote(note)"
        >
          <!-- Text note -->
          <template v-if="note.type === 'Text'">
            <div class="col column ellipsis" style="max-width: 100%;">
              <q-item-label caption class="text-secondary">
                <q-icon name="mdi-text-subject" />
                {{ note.title }}
              </q-item-label>
              <!-- No line breaks to allow correctly rendering whitespace -->
              <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
              <div v-if="!!note.value" style="white-space: pre-wrap">{{ note.value }}</div>
              <div v-else class="text-grey text-italic">
                Click to set
              </div>
            </div>
          </template>

          <template v-if="note.type === 'Graph'">
            <div class="col-grow">
              <q-item-label caption class="text-secondary">
                <q-icon name="mdi-chart-line" />
                {{ note.title }}
              </q-item-label>
              <div class="col-grow row wrap">
                <span :class="{'text-grey': note.start === null}">
                  {{ shortDateString(note.start, 'Not started') }}
                </span>
                <span v-if="note.start" :class="{'text-grey': note.end === null, 'q-ml-xs': true}">
                  <q-icon name="mdi-arrow-right" />
                  {{ shortDateString(note.end, 'In progress') }}
                </span>
              </div>
            </div>
            <q-btn v-if="note.start === null" flat dense icon="mdi-play" @click.stop="startGraphNote(note)">
              <q-tooltip>Start</q-tooltip>
            </q-btn>
            <q-btn v-else-if="note.end === null" flat dense icon="mdi-stop" @click.stop="stopGraphNote(note)">
              <q-tooltip>Stop</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="mdi-calendar-clock" @click.stop="editGraphNote(note)">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
