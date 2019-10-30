<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { saveFile } from '@/helpers/import-export';

import SessionNotesBasic from './SessionNotesBasic.vue';
import SessionNotesFull from './SessionNotesFull.vue';
import { SessionNote, SessionNotesConfig } from './types';


@Component({
  components: {
    Basic: SessionNotesBasic,
    Full: SessionNotesFull,
  },
})
export default class SessionNotesWidget extends WidgetBase<SessionNotesConfig> {

  get notes(): SessionNote[] {
    return this.widget.config.notes;
  }

  exportNotes(): void {
    const name = `${this.widget.title} ${new Date().toLocaleDateString()}`;
    const lines: string[] = [
      name,
      '',
      ...this.notes.map(note => {
        return `[${note.title}]\n${
          note.value === null
            ? ''
            : note.type === 'date'
              ? new Date(Date.parse(note.value!)).toLocaleString()
              : note.value!
          }\n`;
      }),
    ];
    saveFile(lines.join('\n'), `${name}.txt`, true);
  }

  clearNotes(): void {
    this.notes.forEach(note => note.value = null);
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
          <ActionItem icon="mdi-file-export" label="Save to file" @click="exportNotes" />
          <ActionItem icon="clear" label="Empty notes" @click="clearNotes" />
          <WidgetActions :crud="crud" />
        </template>
      </component>
    </template>
  </component>
</template>
