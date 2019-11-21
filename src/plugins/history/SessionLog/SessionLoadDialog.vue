<script lang="ts">
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { historyStore } from '../store';
import { LoggedSession } from '../types';


@Component
export default class SessionLoadDialog extends DialogBase {
  selected: string | null = null;
  filteredOpts: SelectOption[] = [];

  get sessions(): LoggedSession[] {
    return historyStore.sessionValues;
  }

  get sessionOpts(): SelectOption[] {
    return this.sessions.map(session => ({
      label: `${session.title} (${new Date(session.date).toLocaleDateString()})`,
      value: session.id,
    }));
  }


  filterFn(val, update): void {
    if (val === '') {
      update(() => this.filteredOpts = this.sessionOpts);
      return;
    }

    update(() => {
      const needle = val.toLowerCase();
      this.filteredOpts = this.sessionOpts
        .filter(opt => opt.label.toLowerCase().match(needle));
    });
  }

  save(): void {
    if (this.selected !== null) {
      this.onDialogOk(this.selected);
    }
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
        <q-select
          v-model="selected"
          :options="filteredOpts"
          :rules="[v => !!v || 'You must select a session']"
          label="Available sessions"
          autofocus
          clearable
          emit-value
          map-options
          item-aligned
          use-input
          @filter="filterFn"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="selected === null" flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
