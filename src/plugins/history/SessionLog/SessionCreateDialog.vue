<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop, Watch } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/plugins/spark/parse-object';

import { emptyGraphConfig } from '../getters';
import { historyStore } from '../store';
import { LoggedSession, SessionGraphNote, SessionNote } from '../types';
import SessionSelectField from './SessionSelectField.vue';


@Component({
  components: {
    SessionSelectField,
  },
})
export default class SessionCreateDialog extends DialogBase {
  sessionTitle = 'New Session'
  tags: string[] = [];
  customTags = false;
  source: LoggedSession | null = null;
  example: LoggedSession = {
    id: uid(),
    title: 'Example session',
    date: new Date().getTime(),
    notes: [
      {
        id: uid(),
        title: 'Example note',
        type: 'Text',
        value: '',
        col: 12,
      },
      {
        id: uid(),
        title: 'Subprocess graph',
        type: 'Graph',
        start: null,
        end: null,
        config: emptyGraphConfig(),
        col: 12,
      },
    ],
    tags: [],
  }

  @Prop({ type: String, required: false })
  public readonly preselected!: string | null;

  @Prop({ type: Array, required: true })
  public readonly widgetTags!: string[];

  @Watch('source', { immediate: true })
  watchSource(newSource): void {
    if (!this.customTags) {
      this.resetTags(newSource);
    }
  }

  created(): void {
    this.source = this.preselected
      ? historyStore.sessionById(this.preselected)
      : this.example;
    this.example.tags = [...this.widgetTags];
  }

  get sessions(): LoggedSession[] {
    return [this.example, ...historyStore.sessions];
  }

  get knownTags(): string[] {
    return historyStore.sessionTags;
  }

  saveTags(tags: string[]): void {
    this.customTags = true;
    this.tags = tags;
  }

  resetTags(source: LoggedSession | null = this.source): void {
    this.customTags = false;
    this.tags = [
      ...this.widgetTags,
      ...source?.tags?.filter(t => !t.startsWith('on:')) ?? [],
    ];
  }

  sourceNotes(): SessionNote[] {
    if (this.source === null) {
      return [];
    }
    return this.source.notes
      .map(note => {
        const copy = deepCopy(note);
        copy.id = uid();
        if (note.type === 'Text') {
          return { ...copy, value: '' };
        }
        if (note.type === 'Graph') {
          (copy as SessionGraphNote).config.layout.annotations = [];
          return { ...copy, start: null, end: null };
        }
        return copy;
      });
  }

  async save(): Promise<void> {
    const id = uid();
    const session: LoggedSession = {
      id,
      title: this.sessionTitle,
      date: new Date().getTime(),
      notes: this.sourceNotes(),
      tags: this.tags,
    };
    await historyStore.createSession(session);
    this.onDialogOk(session);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard :title="title">
      <q-input
        v-model="sessionTitle"
        label="Session name"
        autofocus
        item-aligned
      />
      <SessionSelectField
        v-model="source"
        :sessions="sessions"
        label="Use same fields as:"
      />
      <TagSelectField
        :value="tags"
        :existing="knownTags"
        class="tag-select"
        @input="saveTags"
      >
        <template v-if="customTags" #append>
          <q-btn
            icon="mdi-backup-restore"
            flat
            round
            dense
            class="self-center"
            @click="resetTags()"
          >
            <q-tooltip>
              Undo tag changes
            </q-tooltip>
          </q-btn>
        </template>
      </TagSelectField>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>


<style>
.tag-select .q-field__append {
  align-self: flex-end;
}
</style>
