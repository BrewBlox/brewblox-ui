<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { shortDateString, spliceById } from '@/helpers/functional';

import { historyStore } from '../store';
import { LoggedSession, SessionGraphNote, SessionNote } from '../types';
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
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <slot name="graph" />

    <q-card-section v-if="session !== null">
      <SessionHeaderField :session="session" @update:session="saveSession" />
      <div class="row">
        <q-item
          v-for="note in notes"
          :key="note.id"
          clickable
          :class="[`col-${note.col}`, 'align-children', 'self-start']"
          @click="openNote(note)"
        >
          <!-- Text note -->
          <template v-if="note.type === 'Text'">
            <q-item-section>
              <q-item-label caption class="text-info">
                <q-icon name="mdi-text-subject" />
                {{ note.title }}
              </q-item-label>
              <!-- No line breaks to allow correctly rendering whitespace -->
              <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
              <div v-if="!!note.value" style="white-space: pre-wrap">{{ note.value }}</div>
              <div v-else class="text-grey text-italic">
                Click to set
              </div>
            </q-item-section>
          </template>
          <!-- Graph note -->
          <template v-if="note.type === 'Graph'">
            <q-item-section>
              <q-item-label caption class="text-info">
                <q-icon name="mdi-chart-line" />
                {{ note.title }}
              </q-item-label>
              <div class="row wrap">
                <span :class="{'text-grey': note.start === null}">
                  {{ shortDateString(note.start, 'Not started') }}
                </span>
                <span v-if="note.start" :class="{'text-grey': note.end === null, 'q-ml-xs': true}">
                  <q-icon name="mdi-arrow-right" />
                  {{ shortDateString(note.end, 'In progress') }}
                </span>
              </div>
            </q-item-section>
            <q-btn v-if="note.start === null" flat stretch label="Start" @click.stop="startGraphNote(note)" />
            <q-btn v-else-if="note.end === null" flat stretch label="End" @click.stop="stopGraphNote(note)" />
            <q-btn v-else flat stretch icon="mdi-calendar-clock" @click.stop="editGraphNote(note)">
              <q-tooltip>Change dates</q-tooltip>
            </q-btn>
          </template>
        </q-item>
      </div>
    </q-card-section>

    <q-card-section v-else class="column justify-end" style="height: 40%">
      <div class="col-auto row justify-center">
        <q-btn outline label="New session" @click="addSession" />
      </div>
    </q-card-section>
  </q-card>
</template>
