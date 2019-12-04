<script lang="ts">
import marked from 'marked';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { saveFile } from '@/helpers/import-export';

import { historyStore } from '../store';
import { LoggedSession, SessionNote } from '../types';
import SessionCreateDialog from './SessionCreateDialog.vue';
import SessionLoadDialog from './SessionLoadDialog.vue';
import SessionLogBasic from './SessionLogBasic.vue';
import SessionLogFull from './SessionLogFull.vue';
import SessionLogHelp from './SessionLogHelp.vue';
import { SessionLogConfig } from './types';


@Component({
  components: {
    SessionLogHelp,
    SessionCreateDialog,
    SessionLoadDialog,
    Basic: SessionLogBasic,
    Full: SessionLogFull,
  },
})
export default class SessionLogWidget extends WidgetBase<SessionLogConfig> {

  get sessions(): LoggedSession[] {
    return historyStore.sessionValues;
  }

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

  startAddSession(): void {
    createDialog({
      component: SessionCreateDialog,
      parent: this,
      title: 'New Session',
      preselected: this.config.currentSession,
    })
      .onOk(id => {
        this.config.currentSession = id;
        this.saveConfig();
      });
  }

  startLoadSession(): void {
    createDialog({
      component: SessionLoadDialog,
      parent: this,
      title: 'Select Session',
      initialValue: this.config.currentSession,
    })
      .onOk(id => {
        this.config.currentSession = id;
        this.saveConfig();
      });
  }

  exitSession(): void {
    this.config.currentSession = null;
    this.saveConfig();
  }

  renderDate(date: number | null): string {
    return date !== null
      ? new Date(date).toLocaleString()
      : '??';
  }

  exportSession(): void {
    if (this.session === null) { return; }
    const session = this.session!;
    const name = `${this.widget.title} ${session.title} ${this.renderDate(session.date)}`;
    const lines: string[] = [
      name,
      '',
      ...this.notes.map(note => {
        const title = `${note.title}\n${'-'.repeat(note.title.length)}`;
        if (note.type === 'Text') {
          return `${title}\n${note.value}\n`;
        }
        if (note.type === 'Graph') {
          return `${title}\n${this.renderDate(note.start)} - ${this.renderDate(note.end)}`;
        }
        return title;
      }),
    ];
    saveFile(marked(lines.join('\n')), `${name}.html`, true);
  }

  clearNotes(): void {
    this.notes.forEach(note => {
      if (note.type === 'Text') {
        note.value = '';
      }
      else if (note.type === 'Graph') {
        note.start = null;
        note.end = null;
      }
    });
    this.saveSession();
  }

  startRemoveSession(): void {
    if (this.session === null) { return; }
    const session = this.session;
    createDialog({
      title: 'Remove session',
      message: `Do you want remove session '${session.title}'?`,
      cancel: true,
    })
      .onOk(() => {
        this.config.currentSession =
          this.sessions.find(s => s.id !== this.session?.id)?.id ?? null;
        this.saveConfig();
        historyStore.removeSession(session);
      });
  }

  showHelp(): void {
    createDialog({
      component: SessionLogHelp,
      parent: this,
    });
  }
}
</script>

<template>
  <component
    :is="mode"
    :crud="crud"
    :class="cardClass"
    @add="startAddSession"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <!-- TODO -->
          <!-- <ActionItem icon="help" label="About" @click="showHelp" /> -->
          <ActionItem icon="add" label="New session" @click="startAddSession" />
          <ActionItem icon="mdi-swap-vertical-bold" label="Open session" @click="startLoadSession" />
          <ActionItem :disabled="!session" icon="mdi-exit-run" label="Exit session" @click="exitSession" />
          <ActionItem :disabled="!session" icon="mdi-file-export" label="Export session" @click="exportSession" />
          <ActionItem icon="clear" label="Clear session notes" @click="clearNotes" />
          <ActionItem icon="delete" label="Remove session" @click="startRemoveSession" />
          <WidgetActions :crud="crud" />
        </template>
      </component>
    </template>
  </component>
</template>
