<script lang="ts">
import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { durationMs, durationString, qtyDurationString, ruleValidator } from '@/helpers/functional';
import { Qty } from '@/plugins/spark/bloxfield';

@Component
export default class TimeUnitDialog extends DialogBase {
  local: string | null = null;

  @Prop({ type: Object, required: true, validator: v => v instanceof Qty })
  public readonly value!: Qty;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: InputRule[];

  created(): void {
    this.local = qtyDurationString(this.value);
  }

  findUnit(s: string): string {
    const match = s.match(/^[0-9\.]*([a-z]*)/i);
    return match && match[1]
      ? match[1]
      : '';
  }

  get defaultUnit(): string {
    return !this.findUnit(this.local || '')
      ? this.findUnit(qtyDurationString(this.value))
      : '';
  }

  get localNumber(): number {
    return durationMs(`${this.local}${this.defaultUnit}`);
  }

  get valueOk(): boolean {
    return ruleValidator(this.rules)(this.localNumber);
  }

  get error(): string | null {
    for (const rule of this.rules) {
      const res = rule(this.localNumber);
      if (isString(res)) {
        return res;
      }
    }
    return null;
  }

  normalize(): void {
    this.local = durationString(this.localNumber);
  }

  save(): void {
    if (!this.valueOk) { return; }
    const val = new Qty(this.localNumber, 'ms');
    this.onDialogOk(val);
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
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="!valueOk" flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
