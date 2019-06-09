<script lang="ts">

import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class InputDialog extends DialogBase {
  local: string | number | null = null;

  @Prop({ type: [String, Number] })
  public readonly value!: string | number;

  @Prop({ type: String, default: 'text', validator: v => ['text', 'number'].includes(v) })
  public readonly type!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: ((v: any) => true | string)[];

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  get error() {
    return this.rules
      .map(f => f(this.local))
      .find(isString) !== undefined;
  }

  save() {
    if (this.error) {
      return;
    }
    const val =
      (this.type === 'number' && isString(this.local))
        ? parseFloat(this.local as string)
        : this.local;
    this.onDialogOk(val);
  }

  created() {
    this.local = this.value;
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
        <q-input
          v-model="local"
          :type="type"
          :rules="rules"
          :clearable="clearable"
          label="Value"
          dark
          autofocus
          step="any"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel"/>
        <q-btn :disable="error" flat label="OK" color="primary" @click="save"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
