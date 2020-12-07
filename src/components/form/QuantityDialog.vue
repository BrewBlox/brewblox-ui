<script lang="ts">
import round from 'lodash/round';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { bloxQty, isQuantity, prettyUnit } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { Quantity } from '@/plugins/spark/types';

@Component
export default class QuantityDialog extends DialogBase {
  local: number | null = null;

  @Prop({ type: Object, required: true, validator: isQuantity })
  public readonly value!: Quantity;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  created(): void {
    this.local = this.value.value !== null
      ? round(this.value.value, this.decimals)
      : null;
  }

  save(): void {
    this.onDialogOk(bloxQty(this.value).copy(this.local));
  }

  get notation(): string {
    return prettyUnit(this.value);
  }

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      type: 'number',
      value: this.local,
      suffix: this.notation,
    })
      .onOk(v => this.local = v);
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
        v-model.number="local"
        :label="label"
        :suffix="notation"
        input-style="font-size: 170%"
        inputmode="numeric"
        pattern="[0-9]*"
        autofocus
        clearable
        item-aligned
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
