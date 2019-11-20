<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

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

  @Prop({ type: String, required: false })
  public readonly preselected!: string | null;

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
    await historyStore.createSession({
      id,
      title: this.sessionTitle,
      date: new Date().getTime(),
      notes: this.sourceNotes(),
    });
    this.onDialogOk(id);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark">
      <q-card-section class="q-dialog__title ellipsis">
        {{ title }}
      </q-card-section>
      <q-card-section class="scroll">
        <q-input
          v-model="sessionTitle"
          label="Session title"
          autofocus
          item-aligned
        />
        <q-select
          v-model="sourceId"
          :options="sessionOpts"
          label="Copy notes from:"
          clearable
          emit-value
          map-options
          item-aligned
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
