<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { SessionGraphNote } from '../types';

type NoteDates = Pick<SessionGraphNote, 'start' | 'end'>;

@Component
export default class SessionGraphNoteDialog extends DialogBase {
  local: NoteDates | null = null;

  @Prop({ type: Object })
  public readonly value!: NoteDates;

  save(): void {
    this.onDialogOk(this.local);
  }

  created(): void {
    const { start, end } = this.value;
    this.local = { start, end };
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <DialogCard v-bind="{title, message, html}">
      <div class="row q-gutter-xs q-ml-md">
        <DatetimeField
          v-model="local.start"
          :rules="[
            date => local.end === null
              || date.getTime() < local.end
              || 'Start must be before than end']"
          title="Start"
          label="Start"
          clear-label="Not started"
          default-now
          class="col-grow"
        />
        <q-btn
          v-if="local.start !== null"
          :disable="local.end !== null"
          icon="clear"
          flat
          class="col-auto"
          @click="local.start = null"
        />

        <div class="col-break" />

        <DatetimeField
          v-model="local.end"
          :rules="[
            date => local.start === null
              || date.getTime() > local.start
              || 'End must be after start']"
          title="End"
          label="End"
          :readonly="local.start === null"
          :clear-label="local.start === null ? 'Not started' : 'In progress'"
          default-now
          class="col-grow"
        />
        <q-btn
          v-if="local.end !== null"
          icon="clear"
          flat
          class="col-auto"
          @click="local.end = null"
        />
      </div>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
