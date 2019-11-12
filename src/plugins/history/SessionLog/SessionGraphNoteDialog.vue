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
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title ellipsis">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-item dark>
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
        <q-item dark>
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
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
