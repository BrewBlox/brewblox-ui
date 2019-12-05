<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop, Watch } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/helpers/units/parseObject';

import { emptyGraphConfig } from '../getters';
import { historyStore } from '../store';
import { LoggedSession, SessionNote } from '../types';


@Component
export default class SessionCreateDialog extends DialogBase {
  exampleId = uid();
  sourceId: string | null = null;
  sessionTitle = 'New Session'
  tags: string[] = [];
  customTags = false;

  @Prop({ type: String, required: false })
  public readonly preselected!: string | null;

  @Prop({ type: Array, required: true })
  public readonly widgetTags!: string[];

  @Watch('sourceId', { immediate: true })
  watchSource(newId): void {
    if (!this.customTags) {
      this.resetTags(newId);
    }
  }

  get sessions(): LoggedSession[] {
    return historyStore.sessionValues;
  }

  get sessionOpts(): SelectOption[] {
    return [
      { label: 'Example Session', value: this.exampleId },
      ...this.sessions.map(session => ({
        label: `${session.title} (${new Date(session.date).toLocaleDateString()})`,
        value: session.id,
      })),
    ];
  }

  get knownTags(): string[] {
    return historyStore.sessionTags;
  }

  saveTags(tags: string[]): void {
    this.customTags = true;
    this.tags = tags;
  }

  resetTags(sessionId: string | null = this.sourceId): void {
    this.customTags = false;
    this.tags = [...this.widgetTags];
    if (sessionId && sessionId !== this.exampleId) {
      const session = historyStore.sessionById(sessionId);
      this.tags.push(...session?.tags?.filter(t => !t.startsWith('on:')) ?? []);
    }
  }

  sourceNotes(): SessionNote[] {
    if (this.sourceId === null) {
      return [];
    }

    if (this.sourceId === this.exampleId) {
      return [
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
      ];
    }

    return historyStore.sessionById(this.sourceId)?.notes
      .map(note => {
        const copy = deepCopy(note);
        copy.id = uid();
        if (note.type === 'Text') {
          return { ...copy, value: '' };
        }
        if (note.type === 'Graph') {
          return { ...copy, start: null, end: null };
        }
        return copy;
      })
      ?? [];
  }

  created(): void {
    this.sourceId = this.preselected ?? this.exampleId;
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
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.ctrl.enter="save">
    <DialogCard :title="title">
      <q-input
        v-model="sessionTitle"
        label="Session name"
        autofocus
        item-aligned
      />
      <q-select
        v-model="sourceId"
        :options="sessionOpts"
        label="Use same fields as:"
        clearable
        emit-value
        map-options
        item-aligned
      />
      <TagSelectField
        :value="tags"
        :existing="knownTags"
        class="tag-select"
        @input="saveTags"
      >
        <template #after>
          <q-btn
            :disable="!customTags"
            icon="mdi-backup-restore"
            flat
            round
            dense
            class="self-center"
            @click="resetTags()"
          >
            <q-tooltip v-if="customTags">
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
.tag-select .q-field__after {
  align-self: center;
}
</style>
