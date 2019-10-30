<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { saveFile } from '@/helpers/import-export';

import SessionNotesBasic from './SessionNotesBasic.vue';
import SessionNotesFull from './SessionNotesFull.vue';
import { Session, SessionNote, SessionNotesConfig } from './types';


@Component({
  components: {
    Basic: SessionNotesBasic,
    Full: SessionNotesFull,
  },
})
export default class SessionNotesWidget extends WidgetBase<SessionNotesConfig> {

  get session(): Session | null {
    return this.config.sessions.find(s => s.id === this.config.currentSession) || null;
  }

  get notes(): SessionNote[] {
    return this.session ? this.session.notes : [];
  }

  addSession(): void {
    const id = uid();
    this.config.sessions.push({
      id,
      title: 'New Session',
      date: new Date().getTime(),
      notes: this.notes.map(note => ({ ...note, id: uid(), value: '' })),
    });
    this.config.currentSession = id;
    this.saveConfig();
  }

  selectSession(id: string): void {
    this.config.currentSession = id;
    this.saveConfig();
  }

  exportSession(): void {
    const session = this.session!;
    const name = `${this.widget.title} ${session.title} ${new Date(session.date).toLocaleDateString()}`;
    const lines: string[] = [
      name,
      '',
      ...this.notes.map(note => {
        return `${note.title}\n${'='.repeat(note.title.length)}\n${note.value}\n`;
      }),
    ];
    saveFile(lines.join('\n'), `${name}.txt`, true);
  }

  clearNotes(): void {
    this.notes.forEach(note => note.value = '');
    this.saveConfig();
  }
}
</script>

<template>
  <component
    :is="mode"
    :crud="crud"
    :class="cardClass"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="add" label="New session" @click="addSession" />
          <ActionItem :disabled="!session" icon="mdi-file-export" label="Export session" @click="exportSession" />
          <ActionItem icon="clear" label="Clear session notes" @click="clearNotes" />
          <q-expansion-item label="Sessions">
            <q-list dark>
              <ActionItem
                v-for="session in config.sessions"
                :key="session.id"
                :label="`${session.title} (${new Date(session.date).toLocaleDateString()})`"
                :item-props="{insetLevel: 0.2}"
                @click="selectSession"
              />
            </q-list>
          </q-expansion-item>
          <WidgetActions :crud="crud" />
        </template>
      </component>
    </template>
  </component>
</template>
