<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { historyStore } from '../store';
import { LoggedSession } from '../types';


@Component
export default class SessionHeaderDialog extends DialogBase {

  @Prop({ type: Object, required: true })
  public readonly session!: LoggedSession;

  save(): void {
    this.onDialogOk(this.session);
  }

  get knownTags(): string[] {
    return historyStore.sessionTags;
  }
}
</script>


<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.ctrl.enter="save">
    <DialogCard :title="title">
      <InputField
        v-model="session.title"
        title="Session name"
        label="Session name"
        dense
        item-aligned
      />
      <DatetimeField
        :value="session.date"
        label="Session date"
        title="Session date"
        default-now
        dense
        item-aligned
        @input="v => session.date = v.getTime()"
      />
      <TagSelectField v-model="session.tags" :existing="knownTags" />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
