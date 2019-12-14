<script lang="ts">

import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { round } from '@/helpers/functional';

const validator = (v: any): boolean => ['text', 'number'].includes(v);

@Component
export default class InputDialog extends DialogBase {
  local: string | number | null = null;

  @Prop({ type: [String, Number] })
  public readonly value!: string | number;

  @Prop({ type: String, default: 'text', validator })
  public readonly type!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: ((v: any) => true | string)[];

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: true })
  public readonly autogrow!: boolean;

  @Prop({ type: String, default: '170%' })
  public readonly fontSize!: string;

  get error(): boolean {
    return this.rules
      .map(f => f(this.local))
      .some(isString);
  }

  save(): void {
    if (this.error) {
      return;
    }
    const val =
      (this.type === 'number' && isString(this.local))
        ? parseFloat(this.local as string)
        : this.local;
    this.onDialogOk(val);
  }

  created(): void {
    if (this.type === 'number') {
      this.local = round(this.value, this.decimals);
    } else {
      this.local = this.value;
    }
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model="local"
        :type="type"
        :rules="rules"
        :clearable="clearable"
        :label="label"
        :autogrow="autogrow"
        :input-style="{fontSize}"
        autofocus
        step="any"
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="error" flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
