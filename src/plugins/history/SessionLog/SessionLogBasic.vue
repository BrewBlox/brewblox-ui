<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { createDialog } from '@/helpers/dialog';

import SessionNoteDialog from './SessionNoteDialog.vue';
import { Session, SessionLogConfig, SessionNote } from './types';


@Component({
  components: {
    SessionNoteDialog,
  },
})
export default class SessionLogBasic extends CrudComponent<SessionLogConfig> {

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

  editNote(note: SessionNote): void {
    createDialog({
      component: SessionNoteDialog,
      title: note.title,
      parent: this,
      value: note.value,
      type: 'text',
      label: 'Content',
    })
      .onOk(value => this.saveNote({ ...note, value }));
  }

  endSession(): void {
    if (this.session === null) { return; }
    this.session.end = new Date().getTime();
    this.saveConfig();
  }

  showGraph(): void {
    if (this.session === null) { return; }
    createDialog({
      component: 'GraphDialog',
      title: 'Graph',
      parent: this,
      graphId: this.session.id,
      config: {
        ...this.session.graphCfg,
        params: {
          start: this.session.start,
          end: this.session.end || undefined,
        },
      },
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
          <span>{{ new Date(session.start).toLocaleString() }}</span>
          <span v-if="session.end !== null">{{ new Date(session.end).toLocaleString() }}</span>
        </q-item-section>
        <q-space />
        <q-item-section class="col-auto">
          <q-btn icon="stop" :disable="session.end !== null" @click="endSession">
            <q-tooltip v-if="session.end === null">
              End session
            </q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn icon="mdi-chart-line" @click="showGraph">
            <q-tooltip>Show graph</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <div class="row">
        <q-item
          v-for="note in notes"
          :key="note.id"
          dark
          clickable
          :class="[`col-${note.col}`, 'align-children']"
          @click="editNote(note)"
        >
          <q-item-section>
            <q-item-label caption class="text-info">
              {{ note.title }}
            </q-item-label>
            <!-- No line breaks to allow correctly rendering whitespace in text notes -->
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <div v-if="!!note.value" :class="`note--${note.type}`">{{ note.value }}</div>
            <div v-else class="text-grey text-italic">
              Click to set
            </div>
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.note--text {
  white-space: pre-wrap;
}
</style>
