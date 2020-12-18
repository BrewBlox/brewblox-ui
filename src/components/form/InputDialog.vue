<script lang="ts">

import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { round, ruleValidator } from '@/helpers/functional';

const typeValidator = (v: any): boolean => ['text', 'number'].includes(v);

@Component
export default class InputDialog extends DialogBase {
  local: string | number | null = null;

  @Prop({ type: [String, Number] })
  public readonly value!: string | number;

  @Prop({ type: String, default: 'text', validator: typeValidator })
  public readonly type!: 'text' | 'number';

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: String, default: '' })
  public readonly label!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: InputRule[];

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly autogrow!: boolean;

  @Prop({ type: String, default: '170%' })
  public readonly fontSize!: string;

  @Prop({ type: String, required: false })
  public readonly suffix!: string;

  get valid(): boolean {
    return ruleValidator(this.rules)(this.local);
  }

  get bound(): any {
    return this.type === 'number'
      ? {
        inputmode: 'numeric',
        pattern: '[0-9]*',
      }
      : {};
  }

  save(): void {
    if (!this.valid) {
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

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.local,
      type: this.type,
      rules: this.rules,
    })
      .onOk(v => this.local = v);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model="local"
        v-bind="{ rules, clearable, label, autogrow, suffix, ...bound }"
        :input-style="{fontSize}"
        autofocus
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="!valid" flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
