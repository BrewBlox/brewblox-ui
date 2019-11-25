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
      <q-item>
        <q-item-section>
          <q-item-label caption>
            Start
          </q-item-label>
          <DatetimeField
            v-model="local.start"
            :rules="[
              date => local.end === null
                || date.getTime() < local.end
                || 'Start must be before than end']"
            title="Start"
            clear-label="Not started"
            default-now
          />
        </q-item-section>
        <q-item-section v-if="local.start !== null" class="col-auto">
          <q-btn :disable="local.end !== null" icon="clear" flat @click="local.start = null" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label caption>
            End
          </q-item-label>
          <DatetimeField
            v-model="local.end"
            :rules="[
              date => local.start === null
                || date.getTime() > local.start
                || 'End must be after start']"
            title="End"
            :readonly="local.start === null"
            :clear-label="local.start === null ? 'Not started' : 'In progress'"
            default-now
          />
        </q-item-section>
        <q-item-section v-if="local.end !== null" class="col-auto">
          <q-btn icon="clear" flat @click="local.end = null" />
        </q-item-section>
      </q-item>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
