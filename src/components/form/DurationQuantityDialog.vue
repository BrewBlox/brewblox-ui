<script lang="ts">
import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { bloxQty, isQuantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { durationMs, durationString } from '@/helpers/duration';
import { ruleValidator } from '@/helpers/functional';
import { Quantity } from '@/plugins/spark/types';

@Component
export default class DurationQuantityDialog extends DialogBase {
  local: string | null = null;

  @Prop({ type: Object, required: true, validator: isQuantity })
  public readonly value!: Quantity;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: InputRule[];

  created(): void {
    this.local = durationString(this.value);
  }

  findUnit(s: string): string {
    const match = s.match(/^[0-9\.]*([a-z]*)/i);
    return match && match[1]
      ? match[1]
      : '';
  }

  get defaultUnit(): string {
    return !this.findUnit(this.local || '')
      ? this.findUnit(durationString(this.value))
      : '';
  }

  get localMs(): number {
    return durationMs(`${this.local}${this.defaultUnit}`);
  }

  get valueOk(): boolean {
    return ruleValidator(this.rules)(this.localMs);
  }

  get error(): string | null {
    for (const rule of this.rules) {
      const res = rule(this.localMs);
      if (isString(res)) {
        return res;
      }
    }
    return null;
  }

  normalize(): void {
    this.local = durationString(this.localMs);
  }

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      type: 'duration',
      value: this.local,
      rules: this.rules.map(f => strV => f(durationMs(strV))),
    })
      .onOk((v: string) => {
        this.local = v;
        this.normalize();
      });
  }

  save(): void {
    if (this.valueOk) {
      this.onDialogOk(bloxQty(this.local ?? '0s'));
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-input
        v-model="local"
        :label="label"
        :suffix="defaultUnit"
        :error="!!error"
        :error-message="error"
        autofocus
        item-aligned
        @change="normalize"
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="!valueOk" flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
