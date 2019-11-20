<script lang="ts">
import { date as qdate } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class DatepickerDialog extends DialogBase {
  tab = 'date';
  stringValue = '';

  @Prop({ type: Date, required: true })
  public readonly value!: Date;

  @Prop({ type: String, default: 'Date and time' })
  public readonly label!: string;

  get parsed(): Date {
    return qdate.extractDate(this.stringValue, 'YYYY/MM/DD HH:mm:ss');
  }

  get valid(): boolean {
    return !Number.isNaN(this.parsed.getTime());
  }

  setStringVal(dateVal: Date): void {
    this.stringValue = qdate.formatDate(dateVal, 'YYYY/MM/DD HH:mm:ss');
  }

  save(): void {
    if (this.valid) {
      this.onDialogOk(this.parsed);
    }
  }

  created(): void {
    this.setStringVal(this.value);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark">
      <q-card-section class="q-dialog__title">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-tabs v-model="tab" dense active-color="primary" align="justify" narrow-indicator>
        <q-tab name="date" label="Date" />
        <q-tab name="time" label="Time" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="date" class="q-pa-none">
          <q-date
            v-model="stringValue"
            mask="YYYY/MM/DD HH:mm:ss"
            class="maximized"
            @input="tab='time'"
          />
        </q-tab-panel>
        <q-tab-panel name="time" class="q-pa-none">
          <q-time v-model="stringValue" mask="YYYY/MM/DD HH:mm:ss" class="maximized" />
        </q-tab-panel>
      </q-tab-panels>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onDialogCancel" />
        <q-btn :disable="!valid" flat color="primary" label="OK" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
