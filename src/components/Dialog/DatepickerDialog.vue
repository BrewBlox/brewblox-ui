<script lang="ts">
import { date as qdate } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class DatepickerDialog extends DialogBase {
  tab: string = 'date';
  stringValue: string = '';

  @Prop({ type: Date, required: true })
  public readonly value!: Date;

  @Prop({ type: String, default: 'Date and time' })
  public readonly label!: string;

  get parsed(): Date {
    const args =
      (this.stringValue.match(/^(\d*)\/(\d*)\/(\d*) (\d*):(\d*):(\d*)$/) || [])
        .map(Number);
    // Months start at 0 in JavaScript
    // I have no words. At least: none that needn't be censored.
    return new Date(args[1], args[2] - 1, args[3], args[4], args[5], args[6]);
  }

  get valid() {
    return !Number.isNaN(this.parsed.getTime());
  }

  setStringVal(dateVal: Date) {
    this.stringValue = qdate.formatDate(dateVal, 'YYYY/MM/DD HH:mm:ss');
  }

  save() {
    if (this.valid) {
      this.onDialogOk(this.parsed);
    }
  }

  created() {
    this.setStringVal(this.value);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">{{ message }}</q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml"/>
      <q-tabs v-model="tab" dense active-color="primary" align="justify" narrow-indicator>
        <q-tab name="date" label="Date"/>
        <q-tab name="time" label="Time"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel dark name="date" class="q-pa-none">
          <q-date
            v-model="stringValue"
            dark
            mask="YYYY/MM/DD HH:mm:ss"
            class="maximized"
            @input="tab='time'"
          />
        </q-tab-panel>
        <q-tab-panel dark name="time" class="q-pa-none">
          <q-time v-model="stringValue" dark mask="YYYY/MM/DD HH:mm:ss" class="maximized"/>
        </q-tab-panel>
      </q-tab-panels>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onDialogCancel"/>
        <q-btn :disable="!valid" flat color="primary" label="OK" @click="save"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
