<script lang="ts">
import { date as qdate } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class DatetimeDialog extends DialogBase {
  stringValue: string = '';

  @Prop({
    type: Date,
    required: true,
  })
  public readonly value!: Date;

  @Prop({ type: String, default: 'restore' })
  readonly resetIcon!: string;

  get parsed(): Date {
    const args =
      (this.stringValue.match(/^(\d*)\/(\d*)\/(\d*) (\d*):(\d*):(\d*)$/) || [])
        .map(Number);
    return new Date(args[1], args[2], args[3], args[4], args[5], args[6]);
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
      <q-card-section class="scroll">
        <q-item dark>
          <q-item-section>
            <q-input
              v-model="stringValue"
              :rules="[v => !!valid || 'Invalid date']"
              label="YYYY/MM/DD hh:mm:ss"
              mask="####/##/## ##:##:##"
              dark
            />
          </q-item-section>
          <q-item-section class="col-auto">
            <q-btn
              :icon="resetIcon"
              flat
              dense
              label="now"
              class="text-white"
              @click="setStringVal(new Date())"
            />
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onDialogCancel"/>
        <q-btn :disable="!valid" flat color="primary" label="OK" @click="save"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
