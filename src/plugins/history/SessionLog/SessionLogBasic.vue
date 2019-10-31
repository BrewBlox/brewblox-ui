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
}
</script>


<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <slot name="graph" />

    <q-card-section>
      <q-item v-if="!!session" dark>
        <q-item-section class="col-auto text-h6">
          {{ session.title }}
        </q-item-section>
        <q-space />
        <q-item-section class="col-auto">
          {{ new Date(session.date).toLocaleString() }}
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
