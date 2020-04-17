<script lang="ts">
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { historyStore } from '../store';
import { LoggedSession } from '../types';
import SessionSelectField from './SessionSelectField.vue';


@Component({
  components: {
    SessionSelectField,
  },
})
export default class SessionLoadDialog extends DialogBase {
  selected: LoggedSession | null = null;

  get sessions(): LoggedSession[] {
    return historyStore.sessions;
  }

  save(): void {
    this.onDialogOk(this.selected);
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
    <DialogCard v-bind="{title, message, html}">
      <SessionSelectField v-model="selected" :sessions="sessions" label="Select session" />

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
